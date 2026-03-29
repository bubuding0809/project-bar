'use client';

interface TowerMeterProps {
  fill: number;       // 0–1.0
  isActive: boolean;
  target?: number;    // default 0.82
  smooth?: boolean;   // apply css transition to fill
}

export default function TowerMeter({ fill, isActive, target = 0.82, smooth = false }: TowerMeterProps) {
  const pct = Math.min(fill * 100, 100);
  const isShaking = fill > 0.75;
  const isDanger = fill > 0.80;

  return (
    <div
      className={`relative w-16 h-64 rounded-xl overflow-hidden border-2 transition-colors duration-150 ${
        isDanger ? 'border-rose-500 shadow-neon-rose' : isActive ? 'border-neon-violet shadow-neon-violet' : 'border-slate-700'
      } ${isShaking ? 'animate-[shake_0.15s_infinite]' : ''}`}
      style={{ background: '#0a0a14' }}
    >
      {/* Fill bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 ${smooth ? 'transition-all duration-150 ease-linear' : 'transition-none'}`}
        style={{
          height: `${pct}%`,
          background: 'linear-gradient(to top, #8B5CF6, #6366F1, #F59E0B, #F43F5E)',
        }}
      />

      {/* Danger overlay above 80% */}
      {isDanger && (
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-rose-400/60"
          style={{ bottom: '80%', top: 0, background: 'rgba(239,68,68,0.08)' }}
        />
      )}

      {/* Target line */}
      <div
        className="absolute left-0 right-0 border-t-2 border-neon-emerald"
        style={{
          bottom: `${target * 100}%`,
          boxShadow: '0 0 6px 1px #10B981',
        }}
      >
        <span className="absolute right-full mr-1 text-[10px] text-neon-emerald font-bold whitespace-nowrap leading-none -translate-y-1/2 top-0">
          {Math.round(target * 100)}%
        </span>
      </div>
    </div>
  );
}
