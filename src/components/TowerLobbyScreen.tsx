'use client';

import { useState } from 'react';
import { TowerState } from '@/types/tower';

const EMOJIS = ['🎯', '😎', '👻', '🤠', '🦊', '👽'];

interface TowerLobbyScreenProps {
  towerState: TowerState;
  userId: string | null;
  onJoin: (nickname: string, emoji: string) => Promise<void>;
  onStart: () => Promise<void>;
  isJoining: boolean;
}

export default function TowerLobbyScreen({
  towerState,
  userId,
  onJoin,
  onStart,
  isJoining,
}: TowerLobbyScreenProps) {
  const [nickname, setNickname] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);

  const isHost = userId === towerState.host;
  const isInGame = towerState.players.some(p => p.userId === userId);
  const canStart = isHost && towerState.players.length >= 2;

  const handleJoin = async () => {
    if (!nickname.trim() || isJoining) return;
    await onJoin(nickname.trim(), emoji);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-neon-violet p-6 w-full max-w-md">
      <h2 className="text-3xl font-display font-black text-center mb-2 bg-gradient-to-r from-neon-rose to-orange-400 bg-clip-text text-transparent">
        Tower Game
      </h2>
      <p className="text-center text-slate-500 text-sm mb-6">
        Hold to fill. Get closest to 82% without busting.
      </p>

      {/* Host dare preview */}
      {towerState.hostDare && (
        <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          <span className="font-bold">Dare on the table:</span> {towerState.hostDare}
        </div>
      )}

      {/* Player list */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-300 mb-2">
          Players Joined ({towerState.players.length})
        </h3>
        <ul className="space-y-2 max-h-40 overflow-y-auto bg-black/40 rounded-lg p-3 border border-slate-800">
          {towerState.players.map(player => (
            <li
              key={player.userId}
              className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700 text-white"
            >
              <span className="text-2xl">{player.emoji}</span>
              <span className="font-medium">
                {player.nickname}
                {player.userId === towerState.host && (
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
            <label className="block text-sm font-medium text-slate-400 mb-1">Your Nickname</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Enter nickname"
              className="w-full px-4 py-2 bg-black/40 border border-slate-700 rounded-lg focus:ring-2 focus:ring-neon-rose focus:border-neon-rose outline-none text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Choose Emoji</label>
            <div className="flex gap-2">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl p-2 rounded-lg border cursor-pointer transition-colors ${
                    emoji === e
                      ? 'bg-rose-500/20 border-neon-rose'
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
            className="w-full py-3 bg-gradient-to-r from-neon-rose to-orange-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
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
              className="w-full py-3 bg-gradient-to-r from-neon-rose to-orange-500 text-white rounded-lg font-bold font-display text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-neon-rose"
            >
              {towerState.players.length < 2 ? 'Waiting for more players...' : 'Start Game!'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
