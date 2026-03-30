'use client';

import { PlayerProfile } from '@/types/game';

interface PlayerTurnBannerProps {
  currentPlayer: PlayerProfile | null;
  isMyTurn: boolean;
  slotsFilled: number;
}

export default function PlayerTurnBanner({
  currentPlayer,
  isMyTurn,
  slotsFilled,
}: PlayerTurnBannerProps) {
  const message = isMyTurn
    ? 'Your Turn!'
    : currentPlayer
    ? `Waiting for ${currentPlayer.nickname}...`
    : 'Tap a slot to insert sword';

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 py-3 px-4"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentPlayer && (
            <span className="text-2xl" aria-hidden="true">
              {currentPlayer.emoji}
            </span>
          )}
          <span className="font-medium text-white">
            {currentPlayer ? `${currentPlayer.nickname}'s Turn` : message}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-medium text-neon-violet">{slotsFilled}</span>
          <span>slots filled</span>
        </div>
      </div>
      {isMyTurn && (
        <p className="max-w-md mx-auto mt-1 text-sm text-neon-emerald font-medium">
          Tap a slot to insert sword
        </p>
      )}
    </div>
  );
}
