'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import TowerMeter from './TowerMeter';
import { useTowerHaptics } from '@/hooks/useTowerHaptics';

const TARGET = 0.82;
// v=0.08, k=3; busts at t ≈ 4.17s
const computeFill = (elapsedSeconds: number): number =>
  (-1 / 3) * Math.log(Math.max(1e-9, 1 - 3 * 0.08 * elapsedSeconds));

interface TowerHoldScreenProps {
  playerName: string;
  emoji: string;
  onSubmit: (fill: number) => Promise<void>;
}

export default function TowerHoldScreen({ playerName, emoji, onSubmit }: TowerHoldScreenProps) {
  const [phase, setPhase] = useState<'countdown' | 'idle' | 'holding' | 'releasing'>('countdown');
  const [countdown, setCountdown] = useState(3);
  const [displayFill, setDisplayFill] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const holdStartRef = useRef<number | null>(null);
  const fillRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);
  const { startEngine, startDanger, bust, success, stop } = useTowerHaptics();
  const dangerTriggeredRef = useRef(false);

  // 3-second countdown on mount
  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(id);
          setPhase('idle');
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
    dangerTriggeredRef.current = false;
    setPhase('holding');
    startEngine();

    const tick = () => {
      if (holdStartRef.current === null) return;
      const elapsed = (performance.now() - holdStartRef.current) / 1000;
      const fill = computeFill(elapsed);
      fillRef.current = fill;
      setDisplayFill(fill);

      if (fill > 0.80 && !dangerTriggeredRef.current) {
        dangerTriggeredRef.current = true;
        startDanger();
      }

      if (fill >= 1.0) {
        bust();
        submit(fill);
        return;
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [phase, submitted, submit, startEngine, startDanger, bust]);

  const stopHolding = useCallback(() => {
    if (phase !== 'holding') return;
    const finalFill = fillRef.current;
    if (finalFill < 1.0) {
      success();
    }
    stop();
    submit(finalFill);
  }, [phase, submit, success, stop]);

  if (phase === 'countdown') {
    return (
      <div className="flex flex-col items-center justify-center gap-6">
        <p className="text-slate-400 font-medium">Get ready, {emoji} {playerName}!</p>
        <div className="text-8xl font-display font-black text-neon-violet animate-pulse">{countdown}</div>
        <p className="text-slate-500 text-sm">Hold the button to fill the tower</p>
      </div>
    );
  }

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

      <p className="text-slate-500 text-xs">Release to stop. Don&apos;t bust at 100%!</p>
    </div>
  );
}
