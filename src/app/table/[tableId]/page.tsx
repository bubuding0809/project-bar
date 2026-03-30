"use client";

import React, { use, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { menuData } from "@/data/menu";
import Menu from "@/components/Menu";
import GameOverlay from "@/components/GameOverlay";
import { GameState } from "@/types/game";

const TowerOverlay = dynamic(() => import("@/components/TowerOverlay"), {
  ssr: false,
  loading: () => null,
});

const BarrelGame = dynamic(() => import("@/components/barrel/BarrelGame"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  params: Promise<{
    tableId: string;
  }>;
};

export default function TableMenuPage({ params }: Props) {
  const { tableId } = use(params);
  const router = useRouter();

  // Flatten menu items for easy lookup
  const allItems = menuData.flatMap(category => category.items);

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isTowerSheetOpen, setIsTowerSheetOpen] = useState(false);
  const [isBarrelSheetOpen, setIsBarrelSheetOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(allItems[0]?.name || "Tequila Shots");
  const [quantity, setQuantity] = useState(1);
  const [hostDare, setHostDare] = useState("");

  const [isRouletteActive, setIsRouletteActive] = useState(false);
  const [isTowerActive, setIsTowerActive] = useState(false);
  const [isBarrelActive, setIsBarrelActive] = useState(false);
  const [hostCreatedGame, setHostCreatedGame] = useState<GameState | null>(null);

  const selectedItem = allItems.find(item => item.name === selectedDrink);
  const price = selectedItem
    ? typeof selectedItem.price === "string"
      ? parseFloat(selectedItem.price.replace("$", ""))
      : selectedItem.price
    : 10;

  // Hydrate initial active state from server
  useEffect(() => {
    Promise.all([
      fetch(`/api/game/${tableId}`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`/api/tower/${tableId}`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`/api/barrel/${tableId}`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([g, t, b]) => {
      setIsRouletteActive(!!g?.game);
      setIsTowerActive(!!t?.game);
      setIsBarrelActive(!!b?.game);
    });
  }, [tableId]);

  const handleCreateGame = async () => {
    let userId = localStorage.getItem("demo_user_id");
    if (!userId) {
      userId = `host_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("demo_user_id", userId);
    }

    try {
      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          roundId: `round_${Date.now()}`,
          hostProfile: {
            userId,
            nickname: "Host Master",
            emoji: "👑",
          },
          drinkType: selectedDrink,
          drinkQuantity: quantity,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setIsBottomSheetOpen(false);
      if (data.game) setHostCreatedGame(data.game);
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsBottomSheetOpen(false);
    }
  };

  const handleCreateTowerGame = async () => {
    let userId = localStorage.getItem("demo_user_id");
    if (!userId) {
      userId = `host_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("demo_user_id", userId);
    }

    try {
      const response = await fetch("/api/tower/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          roundId: `tower_${Date.now()}`,
          hostProfile: {
            userId,
            nickname: "Host Master",
            emoji: "👑",
          },
          hostDare: hostDare.trim() || undefined,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsTowerSheetOpen(false);
      setHostDare("");
    } catch (error) {
      console.error("Failed to create tower game:", error);
      setIsTowerSheetOpen(false);
    }
  };

  const handleCreateBarrelGame = async () => {
    let userId = localStorage.getItem("demo_user_id");
    if (!userId) {
      userId = `host_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("demo_user_id", userId);
    }

    try {
      const response = await fetch("/api/barrel/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          roundId: `barrel_${Date.now()}`,
          hostProfile: {
            userId,
            nickname: "Host Master",
            emoji: "🏴‍☠️",
          },
        }),
      });
      console.log("Barrel create response:", response.status, await response.text());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setIsBarrelSheetOpen(false);
      setIsBarrelActive(true);
    } catch (error) {
      console.error("Failed to create barrel game:", error);
      setIsBarrelSheetOpen(false);
    }
  };

  const isAnyGameActive = isRouletteActive || isTowerActive || isBarrelActive;

  return (
    <div className="min-h-screen bg-background text-foreground pb-36 relative">
      <GameOverlay tableId={tableId} onGameActiveChange={setIsRouletteActive} hostInitiatedGame={hostCreatedGame} />
      <TowerOverlay tableId={tableId} onGameActiveChange={setIsTowerActive} />
      <BarrelGame key={tableId} tableId={tableId} onGameActiveChange={setIsBarrelActive} />

      {/* Header */}
      <header className="pt-10 pb-6 px-6 bg-background z-10 border-b border-surface">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-display font-black bg-gradient-to-r from-neon-violet to-primary bg-clip-text text-transparent">
              Neon Nights
            </h1>
            <p className="text-sm text-slate-400 mt-1">Table #{tableId} • Menu</p>
          </div>
        </div>
      </header>

      {/* Menu Component */}
      <Menu />

      {/* Floating CTA Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none flex flex-col items-center gap-3 pb-8 z-20">
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          disabled={isAnyGameActive}
          className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-neon-violet to-primary shadow-neon-violet text-white font-bold text-lg font-display hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          Play Drink Roulette
        </button>
        <button
          onClick={() => setIsTowerSheetOpen(true)}
          disabled={isAnyGameActive}
          className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-neon-rose to-orange-500 shadow-neon-rose text-white font-bold text-lg font-display hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          Play Tower Game
        </button>
        <button
          onClick={() => setIsBarrelSheetOpen(true)}
          disabled={isAnyGameActive}
          className="pointer-events-auto flex items-center justify-center gap-3 w-full max-w-sm py-4 px-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30 text-white font-bold text-lg font-display hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
        >
          Play Pirate Barrel
        </button>
      </div>

      {/* Roulette Bottom Sheet */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50">
          <div className="bg-slate-900 w-full p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Set the Stakes</h2>
            <select
              value={selectedDrink}
              onChange={e => setSelectedDrink(e.target.value)}
              className="w-full bg-slate-800 p-2 rounded mb-4 text-white"
            >
              {menuData.map(category => (
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
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-slate-800 rounded text-white cursor-pointer"
              >
                -
              </button>
              <span className="text-xl text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-slate-800 rounded text-white cursor-pointer"
              >
                +
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBottomSheetOpen(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded font-bold cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGame}
                className="flex-1 py-3 bg-violet-600 rounded font-bold text-white cursor-pointer hover:bg-violet-500 transition-colors"
              >
                Create Game (${(price * quantity).toFixed(2)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tower Game Bottom Sheet */}
      {isTowerSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50">
          <div className="bg-slate-900 w-full p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold mb-1 text-white">Tower Game</h2>
            <p className="text-slate-400 text-sm mb-4">
              Hold to fill the tower. Get closest to 82% without busting — winner picks a forfeit.
            </p>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Custom Dare <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="text"
              value={hostDare}
              onChange={e => setHostDare(e.target.value)}
              placeholder="e.g. Do your best impression of someone here"
              className="w-full px-4 py-2 bg-black/40 border border-slate-700 rounded-lg focus:ring-2 focus:ring-neon-rose focus:border-neon-rose outline-none text-white placeholder-slate-600 mb-4"
            />
            <p className="text-slate-600 text-xs mb-4">
              Leave blank to use a random drink or pay forfeit instead.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsTowerSheetOpen(false); setHostDare(""); }}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded font-bold cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTowerGame}
                className="flex-1 py-3 bg-gradient-to-r from-neon-rose to-orange-500 text-white rounded font-bold cursor-pointer hover:opacity-90 transition-all"
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pirate Barrel Bottom Sheet */}
      {isBarrelSheetOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/50">
          <div className="bg-slate-900 w-full p-6 rounded-t-2xl">
            <h2 className="text-xl font-bold mb-1 text-white">Pirate Barrel</h2>
            <p className="text-slate-400 text-sm mb-4">
              Take turns inserting swords. Avoid the trigger slot or face the forfeit!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsBarrelSheetOpen(false)}
                className="flex-1 py-3 bg-slate-800 text-slate-300 rounded font-bold cursor-pointer hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBarrelGame}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded font-bold cursor-pointer hover:opacity-90 transition-all"
              >
                Create Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
