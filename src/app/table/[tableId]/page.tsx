"use client";

import React, { use, useState } from "react";
import { menuData } from "@/data/menu";
import Menu from "@/components/Menu";
import GameOverlay from "@/components/GameOverlay";

type Props = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function TableMenuPage({ params }: Props) {
  const { tableId } = use(params);
  
  // Flatten menu items for easy lookup
  const allItems = menuData.flatMap(category => category.items);
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(allItems[0]?.name || "Tequila Shots");
  const [quantity, setQuantity] = useState(1);
  
  const selectedItem = allItems.find(item => item.name === selectedDrink);
  const price = selectedItem 
    ? typeof selectedItem.price === 'string' 
      ? parseFloat(selectedItem.price.replace('$', '')) 
      : selectedItem.price 
    : 10;

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
      <header className="pt-10 pb-6 px-6 bg-background z-10 border-b border-surface">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
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

      {/* Menu Component handles its own categories, navigation, and sticky behavior */}
      <Menu />

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
              {menuData.map((category) => (
                <optgroup key={category.category} label={category.category}>
                  {category.items.map((item, idx) => (
                    <option key={`${item.name}-${idx}`} value={item.name}>
                      {item.name} (${item.price})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 bg-slate-800 rounded text-white">-</button>
              <span className="text-xl text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 bg-slate-800 rounded text-white">+</button>
            </div>
            <button onClick={handleCreateGame} className="w-full bg-violet-600 p-3 rounded font-bold text-white">
              Create Game (${(price * quantity).toFixed(2)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}