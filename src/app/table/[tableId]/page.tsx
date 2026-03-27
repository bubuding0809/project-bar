"use client";

import React, { use, useState } from "react";
import menuData from "@/data/menu.json";
import MenuItem from "@/components/MenuItem";
import GameOverlay from "@/components/GameOverlay";

type Props = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function TableMenuPage({ params }: Props) {
  const { tableId } = use(params);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState("Tequila Shots");
  const [quantity, setQuantity] = useState(1);
  const price = 10; // Mock price

  const handleCreateGame = async () => {
    let userId = localStorage.getItem('demo_user_id');
    if (!userId) {
      userId = `host_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('demo_user_id', userId);
    }

    try {
      const response = await fetch('/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId,
          roundId: `round_${Date.now()}`,
          hostProfile: {
            userId,
            nickname: 'Host Master',
            emoji: '👑',
          },
          drinkType: selectedDrink,
          drinkQuantity: quantity
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsBottomSheetOpen(false);
    } catch (error) {
      console.error('Failed to create game:', error);
      setIsBottomSheetOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28 relative">
      <GameOverlay tableId={tableId} />
      
      {/* Header */}
      <header className="pt-10 pb-6 px-6 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b border-surface">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-display font-black bg-gradient-to-r from-neon-violet to-primary bg-clip-text text-transparent">
              Neon Nights
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Table #{tableId} • Menu
            </p>
          </div>
        </div>
      </header>

      {/* Menu Content */}
      <main className="px-6 py-8 space-y-12 max-w-2xl mx-auto">
        {menuData.categories.map((category, index) => (
          <section key={index} className="space-y-6">
            <h2 className="text-2xl font-display font-bold text-foreground border-b border-surface pb-2">
              {category.name}
            </h2>
            <div className="space-y-4">
              {category.items.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  description={item.description}
                  price={item.price}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Floating CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex justify-center pb-8 z-20">
        <button 
          onClick={() => setIsBottomSheetOpen(true)}
          className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-neon-violet to-primary shadow-neon-violet text-white font-bold text-lg font-display hover:scale-[1.02] active:scale-95 transition-all duration-200"
        >
          <span>Play Drink Roulette 🎰</span>
        </button>
      </div>

      {/* Bottom Sheet */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50">
          <div className="bg-slate-900 w-full p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Set the Stakes</h2>
            <select value={selectedDrink} onChange={(e) => setSelectedDrink(e.target.value)} className="w-full bg-slate-800 p-2 rounded mb-4 text-white">
              <option value="Tequila Shots">Tequila Shots</option>
              <option value="Jager Bombs">Jager Bombs</option>
            </select>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 bg-slate-800 rounded text-white">-</button>
              <span className="text-xl text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 bg-slate-800 rounded text-white">+</button>
            </div>
            <button onClick={handleCreateGame} className="w-full bg-violet-600 p-3 rounded font-bold text-white">
              Create Game (${price * quantity})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}