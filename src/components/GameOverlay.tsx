'use client';

import { useEffect, useState } from 'react';
import { getClientPusher } from '@/lib/pusher-client';
import { GameState } from '@/types/game';
import SpinWheel from './SpinWheel';
import PaymentScreen from './PaymentScreen';
import WinScreen from './WinScreen';

interface GameOverlayProps {
  tableId: string;
}

export default function GameOverlay({ tableId }: GameOverlayProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [nickname, setNickname] = useState('');
  const [emoji, setEmoji] = useState('🎲');
  const [userId, setUserId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [loserId, setLoserId] = useState<string | null>(null);
  const [showResolution, setShowResolution] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    // Basic local user ID for this demo
    let storedUserId = localStorage.getItem('demo_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedUserId);
    }
    setUserId(storedUserId);

    // Fetch initial state
    const fetchInitialState = async () => {
      try {
        const response = await fetch(`/api/game/${tableId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.game) {
            setGameState(data.game);
          }
        }
      } catch (error) {
        console.error('Failed to fetch initial game state:', error);
      }
    };
    fetchInitialState();

    // Listen only to pusher updates per task requirements
    const pusher = getClientPusher();
    if (!pusher) return;

    const channel = pusher.subscribe(`table-${tableId}`);
    
    channel.bind('game-updated', (data: GameState) => {
      setGameState(data);
    });

    channel.bind('game-spinning', (data: { loserId: string }) => {
      setLoserId(data.loserId);
      setIsSpinning(true);
      setShowResolution(false);
      
      // 10s timeout to simulate completion
      setTimeout(() => {
        setIsSpinning(false);
        setShowResolution(true);
      }, 10000);
    });

    channel.bind('game-paid', () => {
      // Hide the overlay entirely
      setGameState(null);
      setShowResolution(false);
      setIsPaying(false);
      setLoserId(null);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [tableId]);

  const handleJoinGame = async () => {
    if (!userId || !nickname || isJoining) return;
    
    setIsJoining(true);
    try {
      const response = await fetch('/api/game/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          playerProfile: {
            userId,
            nickname,
            emoji,
          },
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to join game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleSpinWheel = async () => {
    if (!userId) return;
    try {
      const response = await fetch('/api/game/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          userId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to spin wheel:', error);
    }
  };

  const handlePay = async () => {
    setIsPaying(true);
    try {
      const response = await fetch('/api/game/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to pay:', error);
      setIsPaying(false);
    }
  };

  if (!gameState) {
    return null;
  }

  // If the game reached PAID state, hide overlay completely
  if (gameState.status === 'PAID') {
    return null;
  }

  if (gameState.status !== 'GATHERING' && gameState.status !== 'SPINNING') {
    return null;
  }

  const isPlayerInGame = gameState.players.some(p => p.userId === userId);
  const isHost = gameState.host === userId;
  const showWheel = isSpinning || (gameState.status === 'SPINNING' && !showResolution);
  const currentLoserId = loserId || gameState.loserId;

  if (showResolution && currentLoserId) {
    if (userId === currentLoserId) {
      return <PaymentScreen onPay={handlePay} isPaying={isPaying} />;
    } else {
      return <WinScreen />;
    }
  }

  if (showWheel && currentLoserId) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <SpinWheel players={gameState.players} loserId={currentLoserId} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-neon-violet p-6 w-full max-w-md">
        <h2 className="text-3xl font-display font-black text-center mb-6 bg-gradient-to-r from-neon-violet to-primary bg-clip-text text-transparent">Roulette Lobby</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-slate-300 mb-2">Players Joined ({gameState.players.length})</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto bg-black/40 rounded-lg p-3 border border-slate-800">
            {gameState.players.map((player) => (
              <li key={player.userId} className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700 text-white">
                <span className="text-2xl">{player.emoji}</span>
                <span className="font-medium">
                  {player.nickname} 
                  {player.userId === gameState.host && <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full border border-yellow-500/30">Host</span>}
                  {player.userId === userId && <span className="ml-2 text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">You</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {!isPlayerInGame ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Your Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname"
                className="w-full px-4 py-2 bg-black/40 border border-slate-700 rounded-lg focus:ring-2 focus:ring-neon-violet focus:border-neon-violet outline-none text-white placeholder-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Choose Emoji</label>
              <div className="flex gap-2">
                {['🎲', '😎', '👻', '🤠', '🦊', '👽'].map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg border cursor-pointer transition-colors ${emoji === e ? 'bg-violet-500/20 border-neon-violet' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleJoinGame}
              disabled={!nickname.trim() || isJoining}
              className="w-full py-3 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-500 shadow-neon-violet disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
              <p className="font-medium">You&apos;re in!</p>
              <p className="text-sm mt-1 text-emerald-500/80">{isHost ? 'Ready to spin?' : 'Waiting for host to start the game...'}</p>
            </div>
            
            {isHost && (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full py-3 bg-gradient-to-r from-neon-violet to-primary text-white rounded-lg font-bold hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer transition-all shadow-neon-violet font-display text-lg"
              >
                Spin Wheel!
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
