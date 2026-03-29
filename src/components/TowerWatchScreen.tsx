'use client';

import { PlayerProfile } from '@/types/game';
import TowerMeter from './TowerMeter';

interface TowerWatchScreenProps {
  currentPlayer: PlayerProfile;
}

export default function TowerWatchScreen({ currentPlayer }: TowerWatchScreenProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-300 text-lg">
        Waiting for <span className="text-white font-bold">{currentPlayer.emoji} {currentPlayer.nickname}</span> to go...
      </p>

      <div className="relative">
        <TowerMeter fill={0} isActive={false} />
        {/* Pulsing placeholder overlay */}
        <div className="absolute inset-0 rounded-xl animate-pulse bg-slate-700/20" />
      </div>

      <p className="text-slate-500 text-sm">Cheering them on...</p>
    </div>
  );
}
