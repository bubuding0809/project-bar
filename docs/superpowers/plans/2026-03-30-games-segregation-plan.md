# Games Segregation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GAMES tab to bottom nav that navigates to a proper Games Hub page showing Tower and Shot Roulette game cards, replacing the current overlay-button approach.

**Architecture:** Games Hub is a new page at `/table/[tableId]/games`. BottomNav gets a 5th GAMES tab that links to this page. Games still launch via existing overlay flow (bottom sheets). Floating game buttons on the main menu page become redundant.

**Tech Stack:** Next.js App Router, React, Tailwind, Lucide icons

---

## File Structure

```
src/
├── components/
│   ├── menu/BottomNav.tsx          # Modify: add GAMES tab
│   └── GamesHub.tsx                # Create: game cards list
└── app/table/[tableId]/
    ├── page.tsx                   # Modify: remove floating game buttons
    └── games/
        └── page.tsx               # Create: Games Hub page
```

---

## Tasks

### Task 1: Update BottomNav with GAMES tab

**Files:**
- Modify: `src/components/menu/BottomNav.tsx`

- [ ] **Step 1: Read current BottomNav**

```bash
cat src/components/menu/BottomNav.tsx
```

- [ ] **Step 2: Update BottomNav to include GAMES tab**

Replace current 4-tab layout with 5 tabs: HOME | MENU | GAMES | CART | PROFILE

```tsx
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Dice5 } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/menu', icon: Search, label: 'Menu' },
  { href: '/games', icon: Dice5, label: 'Games' },
  { href: '/cart', icon: ShoppingCart, label: 'Cart' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const params = useParams();
  const tableId = params?.tableId as string;

  const getHref = (item: typeof navItems[0]) => {
    if (item.href === '/games') return `/table/${tableId}/games`;
    if (item.href === '/cart') return `/table/${tableId}/cart`;
    return item.href;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t h-14 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={getHref(item)}
            className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 3: Verify BottomNav renders**

Run dev server and check bottom nav appears with 5 tabs.

---

### Task 2: Create GamesHub component

**Files:**
- Create: `src/components/GamesHub.tsx`

- [ ] **Step 1: Write GamesHub component**

```tsx
'use client';

import { useState } from 'react';
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
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center`}>
                <Icon size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{game.name}</h3>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </div>
              <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${game.color} text-white font-semibold text-sm`}>
                {game.cta}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add test for GamesHub**

Create: `src/components/__tests__/GamesHub.test.tsx`

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import GamesHub from '../GamesHub';

describe('GamesHub', () => {
  it('renders both game cards', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    expect(screen.getByText('Tower')).toBeInTheDocument();
    expect(screen.getByText('Shot Roulette')).toBeInTheDocument();
  });

  it('calls onPlayTower when Tower card is clicked', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    fireEvent.click(screen.getByText('Play Tower'));
    expect(onPlayTower).toHaveBeenCalled();
  });

  it('calls onPlayRoulette when Roulette card is clicked', () => {
    const onPlayTower = vi.fn();
    const onPlayRoulette = vi.fn();
    render(<GamesHub onPlayTower={onPlayTower} onPlayRoulette={onPlayRoulette} />);
    
    fireEvent.click(screen.getByText('Play Roulette'));
    expect(onPlayRoulette).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- src/components/__tests__/GamesHub.test.tsx
```

---

### Task 3: Create Games Hub page

**Files:**
- Create: `src/app/table/[tableId]/games/page.tsx`

- [ ] **Step 1: Create games page directory and file**

```tsx
'use client';

import { useParams } from 'next/navigation';
import GamesHub from '@/components/GamesHub';

export default function GamesPage() {
  const params = useParams();
  const tableId = params.tableId as string;

  return (
    <div className="min-h-screen bg-background">
      <GamesHub 
        onPlayTower={() => {/* handled by parent page via state */}} 
        onPlayRoulette={() => {/* handled by parent page via state */}} 
      />
    </div>
  );
}
```

Wait — the game launching (bottom sheets) is managed in the parent `/table/[tableId]/page.tsx`. The Games Hub page should either:
- Be part of the same page with conditional rendering, OR
- Use URL state / context to trigger game sheets

**Revised approach:** The Games page should live inside the main table page's shell so it can access the same game state. Since the BottomNav lives inside `Menu.tsx`, we need to restructure or use a context.

**Alternative:** Keep game state in the table page, pass handlers down via context.

- [ ] **Revised Step 1: Create context for game actions**

Create: `src/contexts/GameContext.tsx`

```tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface GameContextValue {
  isTowerSheetOpen: boolean;
  isRouletteSheetOpen: boolean;
  openTowerSheet: () => void;
  openRouletteSheet: () => void;
  closeTowerSheet: () => void;
  closeRouletteSheet: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isTowerSheetOpen, setIsTowerSheetOpen] = useState(false);
  const [isRouletteSheetOpen, setIsRouletteSheetOpen] = useState(false);

  return (
    <GameContext.Provider
      value={{
        isTowerSheetOpen,
        isRouletteSheetOpen,
        openTowerSheet: () => setIsTowerSheetOpen(true),
        openRouletteSheet: () => setIsRouletteSheetOpen(true),
        closeTowerSheet: () => setIsTowerSheetOpen(false),
        closeRouletteSheet: () => setIsRouletteSheetOpen(false),
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGames() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGames must be used within GameProvider');
  return ctx;
}
```

- [ ] **Revised Step 2: Wrap table page with GameProvider**

Modify: `src/app/table/[tableId]/page.tsx`

Add `GameProvider` wrapping content, and pass `openTowerSheet`/`openRouletteSheet` to children.

- [ ] **Revised Step 3: Create Games Hub page that uses context**

```tsx
'use client';

import GamesHub from '@/components/GamesHub';
import { useGames } from '@/contexts/GameContext';

export default function GamesPage() {
  const { openTowerSheet, openRouletteSheet } = useGames();

  return (
    <div className="min-h-screen bg-background">
      <GamesHub 
        onPlayTower={openTowerSheet} 
        onPlayRoulette={openRouletteSheet} 
      />
    </div>
  );
}
```

**Actually, simpler approach:** Instead of creating a separate page, make the Games Hub a section within the main table page that's shown when GAMES nav is active. Use URL search param `?tab=games` to show the hub instead of menu.

- [ ] **Simpler Step 1: Modify table page to show GamesHub based on search param**

Modify: `src/app/table/[tableId]/page.tsx`

Add near the top:
```tsx
const searchParams = useSearchParams();
const activeTab = searchParams.get('tab') || 'menu';
```

Change Menu rendering:
```tsx
{activeTab === 'menu' && <Menu tableId={tableId} />}
{activeTab === 'games' && <GamesHub tableId={tableId} onPlayTower={() => setIsTowerSheetOpen(true)} onPlayRoulette={() => setIsBottomSheetOpen(true)} />}
```

- [ ] **Step 2: Update BottomNav links to use `?tab=` pattern**

Modify BottomNav:
```tsx
const getHref = (item: typeof navItems[0]) => {
  if (!tableId) return item.href;
  if (item.href === '/games') return `/table/${tableId}?tab=games`;
  if (item.href === '/cart') return `/table/${tableId}/cart`;
  return `/table/${tableId}`;
};
```

---

### Task 4: Remove floating game buttons from main page

**Files:**
- Modify: `src/app/table/[tableId]/page.tsx`

- [ ] **Step 1: Remove the floating CTA buttons section**

Remove the `<div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t...">` section that contains the two "Play Drink Roulette" and "Play Tower Game" buttons.

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

---

### Task 5: Update GamesHub to show correct game card info

**Files:**
- Modify: `src/components/GamesHub.tsx`

- [ ] **Step 1: Add game descriptions from actual implementation**

The Tower game is about filling to 82%, Shot Roulette is spin wheel. Already captured in the component.

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/menu/BottomNav.tsx` | Add GAMES tab, Link-based navigation |
| `src/components/GamesHub.tsx` | Create - game cards for Tower and Shot Roulette |
| `src/app/table/[tableId]/page.tsx` | Add `?tab=` routing for games, remove floating buttons |
| `src/app/table/[tableId]/games/page.tsx` | Create - games page (optional, depends on routing approach) |

## Notes

- The `GameOverlay` and `TowerOverlay` still handle the actual game UIs — GamesHub just launches them
- BottomNav links to `/table/${tableId}?tab=games` instead of a separate route
- Cart still uses its own route `/table/[tableId]/cart`
- When on GamesHub, bottom nav GAMES tab should appear active (highlighted)
