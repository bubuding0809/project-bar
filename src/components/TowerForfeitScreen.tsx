'use client';

import { useState } from 'react';
import { TowerState } from '@/types/tower';
import { ForfeitCategory } from '@/data/forfeits';

const CATEGORY_LABELS: Record<ForfeitCategory, string> = {
  dare: 'Social Dare',
  drink: 'Drink Up',
  pay: 'Pay Up',
};

const CATEGORY_COLORS: Record<ForfeitCategory, string> = {
  dare: 'from-amber-500 to-orange-500',
  drink: 'from-neon-violet to-indigo-500',
  pay: 'from-neon-rose to-primary',
};

interface TowerForfeitScreenProps {
  towerState: TowerState;
  userId: string | null;
  onAssignForfeit: (targetUserId: string) => Promise<void>;
  onClose: () => Promise<void>;
}

export default function TowerForfeitScreen({
  towerState,
  userId,
  onAssignForfeit,
  onClose,
}: TowerForfeitScreenProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const isWinner = userId === towerState.winnerId;
  const isHost = userId === towerState.host;
  const category = towerState.forfeitCategory!;
  const forfeitText = towerState.forfeitText!;
  const forfeit = towerState.forfeit;

  const assignablePlayers = towerState.players.filter(p => p.userId !== towerState.winnerId);

  const handleAssign = async () => {
    if (!selectedTarget || isAssigning) return;
    setIsAssigning(true);
    try {
      await onAssignForfeit(selectedTarget);
    } finally {
      setIsAssigning(false);
    }
  };

  const categoryGradient = CATEGORY_COLORS[category] || CATEGORY_COLORS.dare;
  const categoryLabel = CATEGORY_LABELS[category] || 'Forfeit';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-neon-rose p-6 w-full max-w-md">
      <h2 className="text-3xl font-display font-black text-center mb-4 bg-gradient-to-r from-neon-rose to-orange-400 bg-clip-text text-transparent">
        Round Over!
      </h2>

      {/* Winner */}
      {(() => {
        const winner = towerState.players.find(p => p.userId === towerState.winnerId);
        return winner ? (
          <div className="text-center mb-4">
            <p className="text-slate-400 text-sm">Winner</p>
            <p className="text-2xl font-bold text-white">
              {winner.emoji} {winner.nickname}
              {winner.userId === userId && <span className="text-neon-emerald"> (You!)</span>}
            </p>
          </div>
        ) : null;
      })()}

      {/* Forfeit card */}
      <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${categoryGradient} text-white`}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{categoryLabel}</p>
        <p className="text-lg font-bold">{forfeitText}</p>
      </div>

      {/* Not yet assigned — winner picks */}
      {!forfeit && isWinner && (
        <div className="space-y-4">
          <p className="text-slate-400 text-sm text-center">Pick who gets this forfeit:</p>
          <div className="space-y-2">
            {assignablePlayers.map(player => (
              <button
                key={player.userId}
                onClick={() => setSelectedTarget(player.userId)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTarget === player.userId
                    ? 'bg-rose-500/20 border-neon-rose text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{player.emoji}</span>
                <span className="font-medium">{player.nickname}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleAssign}
            disabled={!selectedTarget || isAssigning}
            className="w-full py-3 bg-gradient-to-r from-neon-rose to-orange-500 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all hover:scale-[1.02] active:scale-95"
          >
            {isAssigning ? 'Assigning...' : 'Assign Forfeit'}
          </button>
        </div>
      )}

      {/* Not yet assigned — waiting */}
      {!forfeit && !isWinner && (
        <div className="text-center p-4 bg-slate-800 rounded-lg border border-slate-700 text-slate-400">
          <p>Waiting for the winner to assign the forfeit...</p>
        </div>
      )}

      {/* Forfeit assigned */}
      {forfeit && (() => {
        const target = towerState.players.find(p => p.userId === forfeit.toUserId);
        const from = towerState.players.find(p => p.userId === forfeit.fromUserId);
        return (
          <div className="space-y-4">
            <div className="text-center p-4 bg-rose-500/10 rounded-lg border border-rose-500/30">
              <p className="text-slate-400 text-sm">Forfeit assigned to</p>
              <p className="text-xl font-bold text-white mt-1">
                {target?.emoji} {target?.nickname}
                {target?.userId === userId && <span className="text-neon-rose"> (You!)</span>}
              </p>
              <p className="text-slate-500 text-xs mt-1">by {from?.nickname}</p>
            </div>
            {isHost && (
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-700 text-white rounded-lg font-bold cursor-pointer hover:bg-slate-600 transition-all"
              >
                Done — Close Game
              </button>
            )}
            {!isHost && (
              <p className="text-center text-slate-500 text-sm">Waiting for host to close...</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
