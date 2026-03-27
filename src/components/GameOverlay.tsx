'use client';

import { useEffect, useState } from 'react';
import { getClientPusher } from '@/lib/pusher';
import { GameState } from '@/types/game';
import SpinWheel from './SpinWheel';

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

  useEffect(() => {
    // Basic local user ID for this demo
    let storedUserId = localStorage.getItem('demo_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', storedUserId);
    }
    setUserId(storedUserId);

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
      
      // 10s timeout to simulate completion
      setTimeout(() => {
        setIsSpinning(false);
        // Next task handles the transition
      }, 10000);
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

  if (!gameState) {
    return null;
  }

  if (gameState.status !== 'GATHERING' && gameState.status !== 'SPINNING') {
    return null;
  }

  const isPlayerInGame = gameState.players.some(p => p.userId === userId);
  const isHost = gameState.host === userId;
  const showWheel = isSpinning || gameState.status === 'SPINNING';
  const currentLoserId = loserId || gameState.loserId;

  if (showWheel && currentLoserId) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
        <SpinWheel players={gameState.players} loserId={currentLoserId} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Roulette Lobby</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Players Joined ({gameState.players.length})</h3>
          <ul className="space-y-2 max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
            {gameState.players.map((player) => (
              <li key={player.userId} className="flex items-center gap-2 p-2 bg-white rounded border">
                <span className="text-2xl">{player.emoji}</span>
                <span className="font-medium">
                  {player.nickname} 
                  {player.userId === gameState.host && <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Host</span>}
                  {player.userId === userId && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">You</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {!isPlayerInGame ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Nickname</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter nickname"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose Emoji</label>
              <div className="flex gap-2">
                {['🎲', '😎', '👻', '🤠', '🦊', '👽'].map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-2xl p-2 rounded-lg border cursor-pointer ${emoji === e ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'} hover:bg-gray-50`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleJoinGame}
              disabled={!nickname.trim() || isJoining}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              {isJoining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
              <p className="font-medium">You&apos;re in!</p>
              <p className="text-sm mt-1">{isHost ? 'Ready to spin?' : 'Waiting for host to start the game...'}</p>
            </div>
            
            {isHost && (
              <button
                onClick={handleSpinWheel}
                disabled={isSpinning}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-sm"
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
