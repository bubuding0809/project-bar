# Games Segregation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GAMES tab to bottom nav that shows Games Hub when tapped, replacing the current floating overlay-button approach. No HOME tab.

**Architecture:** BottomNav has 4 tabs: MENU | GAMES | CART | PROFILE. Uses `?view=` query param to switch between Menu and Games Hub inline. Cart and Profile remain as separate routes. Games Hub is a section within the main table page shown when `?view=games`. Floating game buttons on the main page are removed.

**Tech Stack:** Next.js App Router, React, Tailwind, Lucide icons

---

## File Structure

```
src/
├── components/
│   ├── menu/BottomNav.tsx      # Modify: 4 tabs, ?view= routing
│   └── GamesHub.tsx            # Create: game cards list
└── app/table/[tableId]/
    └── page.tsx               # Modify: conditionally render GamesHub, remove floating buttons
```

---

## Tasks

### Task 1: Update BottomNav — 4 tabs, query param routing

**Files:**
- Modify: `src/components/menu/BottomNav.tsx`

- [ ] **Step 1: Read current BottomNav**

```bash
cat src/components/menu/BottomNav.tsx
```

- [ ] **Step 2: Replace BottomNav with 4-tab layout using ?view= routing**

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Search, ShoppingCart, User, Dice5 } from 'lucide-react';

const navItems = [
  { view: 'menu', icon: Search, label: 'Menu' },
  { view: 'games', icon: Dice5, label: 'Games' },
  { route: '/cart', icon: ShoppingCart, label: 'Cart' },
  { route: '/profile', icon: User, label: 'Profile' },
];

export const BottomNav = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const tableId = params?.tableId as string;
  const activeView = searchParams.get('view') || 'menu';

  const getHref = (item: typeof navItems[0]) => {
    if (!tableId) return '/';
    if ('route' in item && item.route) return `/table/${tableId}${item.route}`;
    if ('view' in item) {
      if (item.view === 'menu') return `/table/${tableId}`;
      return `/table/${tableId}?view=${item.view}`;
    }
    return '/';
  };

  const isActive = (item: typeof navItems[0]) => {
    if ('route' in item) return false;
    if ('view' in item) return item.view === activeView;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-background border-t h-14 flex items-center justify-around px-4 z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item);
        return (
          <Link
            key={'view' in item ? item.view : item.route}
            href={getHref(item)}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 3: Run build to verify no errors**

```bash
npm run build 2>&1 | head -50
```

---

### Task 2: Create GamesHub component

**Files:**
- Create: `src/components/GamesHub.tsx`

- [ ] **Step 1: Write GamesHub component**

```tsx
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
```

- [ ] **Step 2: Write test for GamesHub**

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
npm test -- src/components/__tests__/GamesHub.test.tsx --run
```

---

### Task 3: Update table page — conditionally render GamesHub, remove floating buttons

**Files:**
- Modify: `src/app/table/[tableId]/page.tsx`

- [ ] **Step 1: Add useSearchParams import if not present, add view state and GamesHub rendering**

Add to imports:
```tsx
import { useSearchParams } from 'next/navigation';
import GamesHub from '@/components/GamesHub';
```

Add after existing state declarations:
```tsx
const searchParams = useSearchParams();
const activeView = searchParams.get('view') || 'menu';
```

Find the line `<Menu tableId={tableId} />` and replace:
```tsx
{activeView === 'menu' && <Menu tableId={tableId} />}
{activeView === 'games' && (
  <GamesHub
    tableId={tableId}
    onPlayTower={() => setIsTowerSheetOpen(true)}
    onPlayRoulette={() => setIsBottomSheetOpen(true)}
  />
)}
```

- [ ] **Step 2: Remove the floating game buttons**

Find and delete the entire `<div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t...">` block containing "Play Drink Roulette" and "Play Tower Game" buttons.

- [ ] **Step 3: Run build**

```bash
npm run build 2>&1 | tail -30
```

Expected: Build succeeds with no errors.

---

### Task 4: Verify full flow

- [ ] **Step 1: Start dev server**

```bash
npm run dev &
sleep 5
```

- [ ] **Step 2: Navigate to table page, verify:**
- Bottom nav shows 4 tabs: Menu, Games, Cart, Profile
- Tapping Games shows GamesHub with Tower and Shot Roulette cards
- Tapping "Play Tower" opens Tower bottom sheet
- Tapping "Play Roulette" opens Roulette bottom sheet
- No floating game buttons on menu

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/menu/BottomNav.tsx` | Rewrite: 4 tabs, ?view= routing, active state |
| `src/components/GamesHub.tsx` | Create: game cards component |
| `src/components/__tests__/GamesHub.test.tsx` | Create: GamesHub tests |
| `src/app/table/[tableId]/page.tsx` | Conditionally render GamesHub, remove floating buttons |

## Notes

- `GameOverlay` and `TowerOverlay` still handle actual game UIs — GamesHub just launches them
- When `view=games`, Menu is hidden and GamesHub is shown in its place
- Bottom nav persists across views
- Cart/Profile keep their existing routes
