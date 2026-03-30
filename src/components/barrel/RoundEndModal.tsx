'use client';

import { PlayerProfile } from '@/types/game';
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

interface RoundEndModalProps {
  loser: PlayerProfile;
  forfeitCategory: ForfeitCategory;
  forfeitText: string;
  onClose: () => void;
}

export default function RoundEndModal({
  loser,
  forfeitCategory,
  forfeitText,
  onClose,
}: RoundEndModalProps) {
  const categoryGradient = CATEGORY_COLORS[forfeitCategory] || CATEGORY_COLORS.dare;
  const categoryLabel = CATEGORY_LABELS[forfeitCategory] || 'Forfeit';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className="bg-slate-900 border border-slate-800 rounded-xl shadow-neon-rose p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="round-end-title"
      >
        <h2
          id="round-end-title"
          className="text-3xl font-display font-black text-center mb-4 bg-gradient-to-r from-neon-rose to-orange-400 bg-clip-text text-transparent"
        >
          PIRATE POPPED!
        </h2>

        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm">Loser</p>
          <p className="text-2xl font-bold text-white">
            {loser.emoji} {loser.nickname}
          </p>
        </div>

        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${categoryGradient} text-white`}>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">
            {categoryLabel}
          </p>
          <p className="text-lg font-bold">{forfeitText}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-700 text-white rounded-lg font-bold cursor-pointer hover:bg-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-neon-rose focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 min-h-[44px]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
