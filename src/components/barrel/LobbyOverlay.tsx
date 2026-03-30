'use client';

import { useState } from 'react';
import { BarrelState } from '@/types/barrel';

const EMOJIS = ['🎯', '😎', '👻', '🤠', '🦊', '👽'];

interface LobbyOverlayProps {
  barrelState: BarrelState;
  userId: string;
  onJoin: (nickname: string, emoji: string) => Promise<void>;
  onStart: () => Promise<void>;
  isJoining: boolean;
}

export default function LobbyOverlay({
  barrelState,
  userId,
  onJoin,
  onStart,
  isJoining,
}: LobbyOverlayProps) {
  const [nickname, setNickname] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const isHost = userId === barrelState.host;
  const isInGame = barrelState.players.some(p => p.userId === userId);
  const canStart = isHost && barrelState.players.length >= 2;

  const handleJoin = async () => {
    if (!nickname.trim() || isJoining) return;
    await onJoin(nickname.trim(), emoji);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-neon-violet p-6 w-full max-w-md">
      <h2 className="text-3xl font-display font-black text-center mb-2 bg-gradient-to-r from-neon-violet to-neon-rose bg-clip-text text-transparent">
        Pirate Barrel
      </h2>
      <p className="text-center text-slate-500 text-sm mb-6">
        Tap slots. Don&apos;t pop!
      </p>

      <div className="mb-6">
        <h3 className="font-semibold text-slate-300 mb-2">
          Players Joined ({barrelState.players.length})
        </h3>
        <ul className="space-y-2 max-h-40 overflow-y-auto bg-black/40 rounded-lg p-3 border border-slate-800">
          {barrelState.players.map(player => (
            <li
              key={player.userId}
              className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700 text-white"
            >
              <span className="text-2xl">{player.emoji}</span>
              <span className="font-medium">
                {player.nickname}
                {player.userId === barrelState.host && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">
                    Host
                  </span>
                )}
                {player.userId === userId && (
                  <span className="ml-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                    You
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!isInGame ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Your Nickname
            </label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter nickname"
              className="w-full px-4 py-2 bg-black/40 border border-slate-700 rounded-lg focus:ring-2 focus:ring-neon-violet focus:border-neon-violet outline-none text-white placeholder-slate-500 cursor-text"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Choose Emoji
            </label>
            <div className="flex gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg border cursor-pointer transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-neon-violet focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    emoji === e
                      ? 'bg-violet-500/20 border-neon-violet'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleJoin}
            disabled={!nickname.trim() || isJoining}
            className="w-full py-3 bg-gradient-to-r from-neon-violet to-neon-rose text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-center p-4 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
            <p className="font-medium">You&apos;re in!</p>
            <p className="text-sm mt-1 text-emerald-500/80">
              {isHost ? 'Start when everyone is ready.' : 'Waiting for host to start...'}
            </p>
          </div>
          {isHost && (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="w-full py-3 bg-gradient-to-r from-neon-violet to-neon-rose text-white rounded-lg font-bold font-display text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-neon-violet"
            >
              {barrelState.players.length < 2 ? 'Waiting for more players...' : 'Start Game!'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
