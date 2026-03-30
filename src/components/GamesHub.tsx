'use client';

import { Dice5, Target } from 'lucide-react';

const games = [
  {
    id: 'tower',
    name: 'Tower',
    description: 'Fill the tower to 82% without busting. Closest wins!',
    icon: Target,
    color: 'from-neon-rose to-orange-500',
    cta: 'Play Tower',
  },
  {
    id: 'roulette',
    name: 'Shot Roulette',
    description: 'Spin the wheel. Loser drinks!',
    icon: Dice5,
    color: 'from-neon-violet to-primary',
    cta: 'Play Roulette',
  },
];

interface GamesHubProps {
  onPlayTower: () => void;
  onPlayRoulette: () => void;
}

export default function GamesHub({ onPlayTower, onPlayRoulette }: GamesHubProps) {
  const handlePlay = (gameId: string) => {
    if (gameId === 'tower') onPlayTower();
    if (gameId === 'roulette') onPlayRoulette();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-2xl font-bold">Games</h2>
      <div className="grid grid-cols-1 gap-4">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => handlePlay(game.id)}
              className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors text-left cursor-pointer"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center shrink-0`}>
                <Icon size={28} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg">{game.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{game.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${game.color} text-white font-semibold text-sm shrink-0`}>
                {game.cta}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
