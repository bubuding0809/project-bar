'use client';

import LobbyOverlay from './LobbyOverlay';
import { BarrelState } from '@/types/barrel';

interface LobbyScreenProps {
  barrelState: BarrelState;
  userId: string;
  onJoin: (nickname: string, emoji: string) => Promise<void>;
  onStart: () => Promise<void>;
  isJoining: boolean;
}

export default function LobbyScreen({ barrelState, userId, onJoin, onStart, isJoining }: LobbyScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <LobbyOverlay
        barrelState={barrelState}
        userId={userId}
        onJoin={onJoin}
        onStart={onStart}
        isJoining={isJoining}
      />
    </div>
  );
}
