'use client';

import { useEffect, useState } from 'react';
import { PlayerProfile } from '@/types/game';
import TowerMeter from './TowerMeter';
import { getClientPusher } from '@/lib/pusher-client';

interface TowerWatchScreenProps {
  currentPlayer: PlayerProfile;
  tableId: string;
  userId: string;
}

export default function TowerWatchScreen({ currentPlayer, tableId, userId }: TowerWatchScreenProps) {
  const [fill, setFill] = useState(0);

  useEffect(() => {
    const pusher = getClientPusher(userId);
    if (!pusher) return;

    const channel = pusher.subscribe(`private-table-${tableId}`);
    const handleSync = (data: { userId: string, fill: number }) => {
      if (data.userId === currentPlayer.userId) {
        setFill(data.fill);
      }
    };
    
    channel.bind('client-tower-sync', handleSync);

    return () => {
      channel.unbind('client-tower-sync', handleSync);
    };
  }, [tableId, currentPlayer.userId, userId]);

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-slate-300 text-lg">
        Waiting for <span className="text-white font-bold">{currentPlayer.emoji} {currentPlayer.nickname}</span> to go...
      </p>

      <div className="relative">
        <TowerMeter fill={fill} isActive={false} />
        {/* Pulsing placeholder overlay */}
        <div className="absolute inset-0 rounded-xl animate-pulse bg-slate-700/20" />
      </div>

      <p className="text-slate-500 text-sm">Cheering them on...</p>
    </div>
  );
}
