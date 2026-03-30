'use client';

import { PlayerProfile } from '@/types/game';
import TowerMeter from './TowerMeter';

interface TowerWatchScreenProps {
  currentPlayer: PlayerProfile;
  currentFill: number;
}

export default function TowerWatchScreen({ currentPlayer, currentFill }: TowerWatchScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-300 text-lg">
        Waiting for <span className="text-white font-bold">{currentPlayer.emoji} {currentPlayer.nickname}</span> to go...
      </p>

      <div className="relative">
        <TowerMeter fill={currentFill} isActive={currentFill > 0 && currentFill < 1.0} smooth />
        {/* Pulsing placeholder overlay */}
        {currentFill === 0 && <div className="absolute inset-0 rounded-xl animate-pulse bg-slate-700/20" />}
      </div>

      <p className="text-slate-500 text-sm">Cheering them on...</p>
    </div>
  );
}
