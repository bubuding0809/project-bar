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
  
  const { trigger: haptic, cancel: cancelHaptic } = useWebHaptics({ debug: false, showSwitch: true });

  const cancelRaf = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  const submit = useCallback(async (fill: number, isUserAction: boolean) => {
    if (submitted) return;
    setSubmitted(true);
    cancelRaf();
    cancelHaptic?.();
    if (isUserAction) {
      haptic('buzz'); // Play long buzz immediately if user released
    }
    setPhase('releasing');
    await onSubmit(fill);
  }, [submitted, cancelRaf, cancelHaptic, haptic, onSubmit]);

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

      if (fill >= 1.0) {
        submit(fill, false); // Not a direct user interaction, might not vibrate on iOS
        return;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [phase, submitted, submit, onProgress]);

  const stopHolding = useCallback(() => {
    if (phase !== 'holding') {
      // If they already busted while holding, this release event is a trusted user action
      // so we can finally fire the buzz now that they let go!
      if (submitted) {
        cancelHaptic?.();
        haptic('buzz');
      }
      return;
    }
    submit(fillRef.current, true);
  }, [phase, submit, submitted, haptic, cancelHaptic]);

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
        onTouchStart={(e) => { e.preventDefault(); startHolding(); }}
        onMouseDown={(e) => { startHolding(); }}
        onTouchEnd={(e) => { e.preventDefault(); stopHolding(); }}
        onMouseUp={(e) => { stopHolding(); }}
        onMouseLeave={stopHolding}
        onTouchCancel={stopHolding}
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

      <p className="text-slate-500 text-xs">Release to stop. Don&apos;t bust at 100%!</p>
    </div>
  );
}
