'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TowerMeter from './TowerMeter';
import { useWebHaptics } from 'web-haptics/react';

const TARGET = 0.82;
// v=0.08, k=3; busts at t ≈ 4.17s
const computeFill = (elapsedSeconds: number): number =>
  (-1 / 3) * Math.log(Math.max(1e-9, 1 - 3 * 0.08 * elapsedSeconds));

interface TowerHoldScreenProps {
  playerName: string;
  emoji: string;
  onSubmit: (fill: number) => Promise<void>;
  onProgress?: (fill: number) => void;
}

export default function TowerHoldScreen({ playerName, emoji, onSubmit, onProgress }: TowerHoldScreenProps) {
  const [phase, setPhase] = useState<'idle' | 'holding' | 'releasing'>('idle');
  const [displayFill, setDisplayFill] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const fillRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const lastHapticRef = useRef<number>(0);
  
  const { trigger: haptic, isSupported } = useWebHaptics({ debug: true });

  const cancelRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const submit = useCallback(async (fill: number) => {
    if (submitted) return;
    setSubmitted(true);
    cancelRaf();
    setPhase('releasing');
    await onSubmit(fill);
  }, [submitted, cancelRaf, onSubmit]);

  const startHolding = useCallback(() => {
    if (phase !== 'idle' || submitted) return;
    holdStartRef.current = performance.now();
    setPhase('holding');

    const tick = () => {
      if (holdStartRef.current === null) return;
      const elapsed = (performance.now() - holdStartRef.current) / 1000;
      const fill = computeFill(elapsed);
      fillRef.current = fill;
      setDisplayFill(fill);
      onProgress?.(fill);

      // Local haptics (pulse faster as it fills)
      const now = performance.now();
      const hapticInterval = 100 - (fill * 60); // 100ms at 0%, 40ms at 1.0
      if (now - lastHapticRef.current > hapticInterval) {
        lastHapticRef.current = now;
        haptic([{ duration: 30, intensity: Math.max(0.1, fill) }]);
      }

      if (fill >= 1.0) {
        submit(fill);
        return;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [phase, submitted, submit]);

  const stopHolding = useCallback(() => {
    if (phase !== 'holding') return;
    submit(fillRef.current);
  }, [phase, submit]);

  if (phase === 'releasing') {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 text-lg">Submitting...</p>
        <TowerMeter fill={displayFill} isActive={false} target={TARGET} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <p className="text-slate-300 font-medium text-lg">
        {emoji} <span className="text-white font-bold">{playerName}</span> — your turn!
      </p>

      <div className="flex items-center gap-6">
        <TowerMeter fill={displayFill} isActive={phase === 'holding'} target={TARGET} />
        <div className="text-left space-y-2">
          <p className="text-slate-400 text-sm">Target: <span className="text-neon-emerald font-bold">82%</span></p>
          <p className="text-slate-400 text-sm">Fill: <span className="text-white font-mono">{(displayFill * 100).toFixed(1)}%</span></p>
          {displayFill > 0.80 && (
            <p className="text-rose-400 text-sm font-bold animate-pulse">DANGER!</p>
          )}
        </div>
      </div>

      <button
        onPointerDown={startHolding}
        onPointerUp={stopHolding}
        onPointerLeave={stopHolding}
        disabled={submitted}
        className={`w-48 h-48 rounded-full text-white font-display font-black text-2xl transition-all duration-100 cursor-pointer select-none touch-none
          ${phase === 'holding'
            ? 'bg-gradient-to-br from-neon-violet to-primary scale-95 shadow-neon-violet'
            : 'bg-slate-800 border-2 border-neon-violet hover:bg-slate-700 active:scale-95'
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {phase === 'holding' ? 'HOLD!' : 'HOLD'}
      </button>

      <p className="text-slate-500 text-xs">
        {isSupported ? "Release to stop. Don't bust at 100%!" : "Haptics not supported on this device. Release to stop."}
      </p>
    </div>
  );
}
