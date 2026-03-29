'use client';

import { useEffect, useState, useRef } from 'react';
import { getClientPusher } from '@/lib/pusher-client';
import { TowerState, TowerTurnResult } from '@/types/tower';
import TowerLobbyScreen from './TowerLobbyScreen';
import TowerHoldScreen from './TowerHoldScreen';
import TowerWatchScreen from './TowerWatchScreen';
import TowerForfeitScreen from './TowerForfeitScreen';
import { ForfeitCategory } from '@/data/forfeits';

interface TowerOverlayProps {
  tableId: string;
  onGameActiveChange?: (active: boolean) => void;
}

interface TurnResultOverlay {
  result: TowerTurnResult;
  show: boolean;
}

export default function TowerOverlay({ tableId, onGameActiveChange }: TowerOverlayProps) {
  const [towerState, setTowerState] = useState<TowerState | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [turnResult, setTurnResult] = useState<TurnResultOverlay | null>(null);
  // activePlayerId tracks who should show hold screen (set by tower-turn-start)
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const towerStateRef = useRef<TowerState | null>(null);

  // Keep ref in sync for unload handler
  useEffect(() => {
    towerStateRef.current = towerState;
  }, [towerState]);

  // Notify parent of active state
  useEffect(() => {
    onGameActiveChange?.(towerState !== null);
  }, [towerState, onGameActiveChange]);

  useEffect(() => {
    // Resolve userId
    let storedId = localStorage.getItem('demo_user_id');
    if (!storedId) {
      storedId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedId);
    }
    setUserId(storedId);

    // Hydrate from server
    const fetchState = async () => {
      try {
        const res = await fetch(`/api/tower/${tableId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.game) {
            setTowerState(data.game);
            if (data.game.status === 'PLAYER_TURN') {
              const cp = data.game.players[data.game.currentPlayerIndex];
              setActivePlayerId(cp?.userId ?? null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch tower state:', err);
      }
    };
    fetchState();

    // Pusher
    const pusher = getClientPusher(storedId);
    if (!pusher) return;

    const channel = pusher.subscribe(`table-${tableId}`);

    channel.bind('tower-updated', (data: TowerState) => {
      setTowerState(data);
    });

    channel.bind('tower-turn-start', (data: { playerId: string; playerIndex: number }) => {
      setActivePlayerId(data.playerId);
      // Clear turn result overlay once new turn starts
      setTurnResult(null);
    });

    channel.bind('tower-turn-result', (data: { result: TowerTurnResult }) => {
      setTurnResult({ result: data.result, show: true });
      // Auto-hide after 2s
      setTimeout(() => setTurnResult(r => r ? { ...r, show: false } : null), 2000);
    });

    channel.bind('tower-round-end', (data: {
      winnerId: string;
      forfeitCategory: ForfeitCategory;
      forfeitText: string;
      results: TowerTurnResult[];
    }) => {
      setTowerState(prev => prev ? {
        ...prev,
        status: 'ROUND_END',
        winnerId: data.winnerId,
        forfeitCategory: data.forfeitCategory,
        forfeitText: data.forfeitText,
        results: data.results,
      } : null);
    });

    channel.bind('tower-forfeit', (data: { forfeit: TowerState['forfeit'] }) => {
      setTowerState(prev => prev ? { ...prev, status: 'FORFEIT', forfeit: data.forfeit } : null);
    });

    channel.bind('tower-lobby-closed', () => {
      setTowerState(null);
    });

    return () => {
      channel.unbind('tower-updated');
      channel.unbind('tower-turn-start');
      channel.unbind('tower-turn-result');
      channel.unbind('tower-round-end');
      channel.unbind('tower-forfeit');
      channel.unbind('tower-lobby-closed');
      channel.unsubscribe();
    };
  }, [tableId]);

  // Cleanup on unload
  useEffect(() => {
    const handleUnload = () => {
      const state = towerStateRef.current;
      if (!state) return;
      const currentUserId = localStorage.getItem('demo_user_id');
      if (!currentUserId) return;

      if (state.host === currentUserId && state.status === 'LOBBY') {
        fetch('/api/tower/close', {
          method: 'POST',
          body: JSON.stringify({ tableId }),
          keepalive: true,
        });
      } else if (state.host !== currentUserId && state.status === 'LOBBY') {
        fetch('/api/tower/leave', {
          method: 'POST',
          body: JSON.stringify({ tableId, userId: currentUserId }),
          keepalive: true,
        });
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [tableId]);

  const handleJoin = async (nickname: string, emoji: string) => {
    if (!userId || isJoining) return;
    setIsJoining(true);
    try {
      await fetch('/api/tower/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, playerProfile: { userId, nickname, emoji } }),
      });
    } catch (err) {
      console.error('Failed to join tower game:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleStart = async () => {
    if (!userId) return;
    try {
      await fetch('/api/tower/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId }),
      });
    } catch (err) {
      console.error('Failed to start tower game:', err);
    }
  };

  const handleSubmitTurn = async (fill: number) => {
    if (!userId) return;
    try {
      await fetch('/api/tower/submit-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, userId, fill }),
      });
    } catch (err) {
      console.error('Failed to submit turn:', err);
    }
  };

  const handleAssignForfeit = async (targetUserId: string) => {
    if (!userId) return;
    await fetch('/api/tower/forfeit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, winnerId: userId, targetUserId }),
    });
  };

  const handleClose = async () => {
    await fetch('/api/tower/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    });
    setTowerState(null);
  };

  if (!towerState) return null;

  const currentPlayer = towerState.players[towerState.currentPlayerIndex];
  const isMyTurn = activePlayerId === userId && towerState.status === 'PLAYER_TURN';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-start overflow-y-auto p-4 pt-8">
      {/* Turn result overlay (2s flash) */}
      {turnResult?.show && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className={`px-8 py-6 rounded-2xl text-center shadow-2xl ${
            turnResult.result.busted ? 'bg-rose-900 border border-rose-500' : 'bg-emerald-900 border border-emerald-500'
          }`}>
            {turnResult.result.busted ? (
              <p className="text-4xl font-display font-black text-rose-300">BUSTED!</p>
            ) : (
              <p className="text-4xl font-display font-black text-emerald-300">
                {(turnResult.result.fill * 100).toFixed(1)}%
              </p>
            )}
            <p className="text-slate-400 text-sm mt-1">
              {towerState.players.find(p => p.userId === turnResult.result.userId)?.nickname}
            </p>
          </div>
        </div>
      )}

      {towerState.status === 'LOBBY' && (
        <TowerLobbyScreen
          towerState={towerState}
          userId={userId}
          onJoin={handleJoin}
          onStart={handleStart}
          isJoining={isJoining}
        />
      )}

      {towerState.status === 'PLAYER_TURN' && isMyTurn && !turnResult?.show && (
        <TowerHoldScreen
          tableId={tableId}
          userId={userId as string}
          playerName={towerState.players.find(p => p.userId === userId)?.nickname ?? ''}
          emoji={towerState.players.find(p => p.userId === userId)?.emoji ?? ''}
          onSubmit={handleSubmitTurn}
        />
      )}

      {towerState.status === 'PLAYER_TURN' && !isMyTurn && !turnResult?.show && currentPlayer && (
        <TowerWatchScreen currentPlayer={currentPlayer} tableId={tableId} userId={userId as string} />
      )}

      {towerState.status === 'ROUND_END' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
          <h2 className="text-3xl font-display font-black text-center mb-4 bg-gradient-to-r from-neon-rose to-orange-400 bg-clip-text text-transparent">
            Leaderboard
          </h2>
          <ul className="space-y-2 mb-6">
            {[...towerState.results]
              .sort((a, b) => {
                // Sort: non-busted desc, then busted desc
                if (a.busted !== b.busted) return a.busted ? 1 : -1;
                return b.fill - a.fill;
              })
              .map((r, i) => {
                const player = towerState.players.find(p => p.userId === r.userId);
                const isWinner = r.userId === towerState.winnerId;
                return (
                  <li
                    key={r.userId}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isWinner
                        ? 'bg-emerald-500/10 border-neon-emerald text-emerald-300'
                        : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <span className="text-slate-500 font-mono text-sm w-4">{i + 1}</span>
                    <span className="text-xl">{player?.emoji}</span>
                    <span className="flex-1 font-medium">{player?.nickname}</span>
                    <span className={`font-mono text-sm ${r.busted ? 'text-rose-400' : 'text-white'}`}>
                      {r.busted ? 'BUST' : `${(r.fill * 100).toFixed(1)}%`}
                    </span>
                    {isWinner && <span className="text-neon-emerald text-xs font-bold">WIN</span>}
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {(towerState.status === 'FORFEIT' || (towerState.status === 'ROUND_END' && !!towerState.forfeitText)) && (
        <div className="w-full max-w-md mt-4">
          <TowerForfeitScreen
            towerState={towerState}
            userId={userId}
            onAssignForfeit={handleAssignForfeit}
            onClose={handleClose}
          />
        </div>
      )}
    </div>
  );
}
