# Drink Roulette MVP Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement custom drink quantity stakes, robust real-time constraints (late joiners, minimum players), and a synchronized spin experience for the Drink Roulette MVP.

**Architecture:** 
- The UI adds a Bottom Sheet overlay in the Table page for Hosts to configure stakes.
- The `GameState` in Upstash Redis is expanded to hold `drinkType` and `drinkQuantity`.
- The spin relies on a precise `targetEndTime` broadcast via Pusher to ensure all clients stop spinning locally at the same millisecond.
- API endpoints are hardened against race conditions (e.g., late joiners, duplicate lobby creations).

**Tech Stack:** Next.js, Tailwind CSS, Upstash Redis, Pusher, Vitest (for TDD).

---

### Task 0: Setup Vitest for TDD

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Vitest**
```bash
npm install -D vitest @testing-library/react jsdom
```

- [ ] **Step 2: Create config**
Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom' },
})
```

- [ ] **Step 3: Add test script**
Add `"test": "vitest run"` to `package.json` scripts.

- [ ] **Step 4: Commit**
```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "chore: setup vitest for TDD"
```

---

### Task 1: Update Types and State Models

**Files:**
- Modify: `src/types/game.ts`
- Create: `src/types/__tests__/game.test.ts`

- [ ] **Step 1: Write the failing test**
Create `src/types/__tests__/game.test.ts`:
```typescript
import { expect, test } from 'vitest';
import type { GameState } from '../game';

test('GameState includes stakes and timing', () => {
  const state: GameState = {
    status: 'GATHERING', host: 'h1', players: [], roundId: 'r1',
    drinkType: 'Tequila Shots', drinkQuantity: 4, targetEndTime: 123456789
  };
  expect(state.drinkQuantity).toBe(4);
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test
```

- [ ] **Step 3: Write minimal implementation**
Modify `GameState` in `src/types/game.ts`:
```typescript
export interface GameState {
  status: 'GATHERING' | 'SPINNING' | 'PAYMENT_PENDING' | 'PAID' | 'IDLE';
  host: string;
  players: any[];
  roundId: string;
  loserId?: string;
  drinkType?: string;
  drinkQuantity?: number;
  targetEndTime?: number;
}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test
```

- [ ] **Step 5: Commit**
```bash
git add src/types/game.ts src/types/__tests__/game.test.ts
git commit -m "feat: add stakes and timing to GameState model"
```

---

### Task 2: Build the Stakes Configuration Bottom Sheet

**Files:**
- Modify: `src/app/table/[tableId]/page.tsx`
- Create: `src/app/table/[tableId]/__tests__/page.test.tsx`

- [ ] **Step 1: Write the failing test**
Create `src/app/table/[tableId]/__tests__/page.test.tsx`:
```tsx
import { expect, test } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Page from '../page';

test('opens bottom sheet and shows stepper', async () => {
  const params = Promise.resolve({ tableId: '1' });
  render(<Page params={params} />);
  fireEvent.click(screen.getByText('Play Drink Roulette 🎰'));
  expect(screen.getByText('Set the Stakes')).toBeTruthy();
  fireEvent.click(screen.getByText('+'));
  expect(screen.getByText('2')).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test
```

- [ ] **Step 3: Write minimal implementation**
Modify `src/app/table/[tableId]/page.tsx` (Add bottom sheet UI):
```tsx
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState("Tequila Shots");
  const [quantity, setQuantity] = useState(1);
  const price = 10; // Mock price from menuData

  const handleCreateGame = async () => {
    // ... existing POST /api/game/create ...
    body: JSON.stringify({
      tableId, roundId: `round_${Date.now()}`,
      hostProfile: { userId, nickname: 'Host', emoji: '👑' },
      drinkType: selectedDrink, drinkQuantity: quantity
    }),
    // ... on success ...
    setIsBottomSheetOpen(false);
    // If it returns 400 "Game already exists", we also just close the sheet 
    // so GameOverlay (which listens to the active game) takes over and shows the join flow.
  };

  // Add Bottom Sheet JSX
  {isBottomSheetOpen && (
    <div className="fixed inset-0 z-40 flex items-end bg-black/50">
      <div className="bg-slate-900 w-full p-6 rounded-t-2xl">
        <h2 className="text-xl font-bold mb-4">Set the Stakes</h2>
        <select value={selectedDrink} onChange={(e) => setSelectedDrink(e.target.value)} className="w-full bg-slate-800 p-2 rounded mb-4 text-white">
          <option value="Tequila Shots">Tequila Shots</option>
          <option value="Jager Bombs">Jager Bombs</option>
        </select>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 bg-slate-800 rounded">-</button>
          <span className="text-xl">{quantity}</span>
          <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 bg-slate-800 rounded">+</button>
        </div>
        <button onClick={handleCreateGame} className="w-full bg-violet-600 p-3 rounded font-bold">
          Create Game (${price * quantity})
        </button>
      </div>
    </div>
  )}
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test
```

- [ ] **Step 5: Commit**
```bash
git add src/app/table/[tableId]/page.tsx src/app/table/[tableId]/__tests__/page.test.tsx
git commit -m "feat: add stakes configuration bottom sheet with estimated price"
```

---

### Task 3: Update Game Creation & Join Logic

**Files:**
- Modify: `src/app/api/game/create/route.ts`
- Modify: `src/app/api/game/join/route.ts`
- Modify: `src/components/GameOverlay.tsx`
- Create: `src/app/api/game/__tests__/routes.test.ts`

- [ ] **Step 1: Write the failing test**
Create `src/app/api/game/__tests__/routes.test.ts`:
```typescript
import { expect, test } from 'vitest';
import { POST as joinGame } from '../join/route';

test('join rejects late joiners', async () => {
  // Mock Request assuming status is 'SPINNING'
  const req = new Request('http://localhost/api/game/join', {
    method: 'POST',
    body: JSON.stringify({ tableId: '1', playerProfile: { userId: '1', nickname: 'A', emoji: '1' }})
  });
  const res = await joinGame(req);
  expect(res.status).toBe(400);
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test
```

- [ ] **Step 3: Write minimal implementation**
In `src/app/api/game/create/route.ts`:
```typescript
    const { tableId, roundId, hostProfile, drinkType, drinkQuantity } = body;
    const gameKey = `table:${tableId}:game`;
    if (await redis.exists(gameKey)) {
      return NextResponse.json({ error: 'Game already exists' }, { status: 400 });
    }
    const gameState = { ...existing, drinkType, drinkQuantity };
```
In `src/app/api/game/join/route.ts`:
```typescript
    if (gameState.status !== 'GATHERING') {
      return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
    }
```
In `src/components/GameOverlay.tsx`:
```typescript
      if (!response.ok) {
        if (response.status === 400) alert('Game has already started');
        throw new Error('Failed to join');
      }
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test
```

- [ ] **Step 5: Commit**
```bash
git add src/app/api/game/create/route.ts src/app/api/game/join/route.ts src/components/GameOverlay.tsx src/app/api/game/__tests__/routes.test.ts
git commit -m "feat: enforce stakes and late joiner rejections in APIs"
```

---

### Task 4: Update the Lobby UI & Local Spin Sync

**Files:**
- Modify: `src/components/GameOverlay.tsx`
- Modify: `src/app/api/game/spin/route.ts`
- Create: `src/components/__tests__/GameOverlay.test.tsx`

- [ ] **Step 1: Write the failing test**
Create `src/components/__tests__/GameOverlay.test.tsx`:
```tsx
import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameOverlay from '../GameOverlay';

test('disables spin when < 2 players', () => {
  // Mock fetch/pusher before render
  render(<GameOverlay tableId="1" />);
  // Assuming mocked state with 1 player
  expect(screen.getByText('Waiting for more players...')).toBeTruthy();
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test
```

- [ ] **Step 3: Write minimal implementation**
In `src/components/GameOverlay.tsx`: 
```tsx
  // Show stakes
  {gameState.drinkType && <p className="text-center text-emerald-400 mb-4 font-bold text-lg">Playing for {gameState.drinkQuantity}x {gameState.drinkType}</p>}
  
  // Disable button
  <button onClick={handleSpinWheel} disabled={isSpinning || gameState.players.length < 2}>
    {gameState.players.length < 2 ? 'Waiting for more players...' : 'Spin Wheel!'}
  </button>

  // Sync spin
  channel.bind('spin_start', (data: any) => {
    setLoserId(data.loserId);
    setIsSpinning(true);
    setShowResolution(false);
    const remainingTime = Math.max(0, data.targetEndTime - Date.now());
    setTimeout(() => {
      setIsSpinning(false);
      setShowResolution(true);
    }, remainingTime);
  });
```
In `src/app/api/game/spin/route.ts`: 
```typescript
  if (gameState.players.length < 2) return NextResponse.json({error: 'Not enough players'}, {status: 400});
  const targetEndTime = Date.now() + 10000;
  await serverPusher.trigger(`table-${tableId}`, 'spin_start', { loserId, targetEndTime });
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test
```

- [ ] **Step 5: Commit**
```bash
git add src/components/GameOverlay.tsx src/app/api/game/spin/route.ts src/components/__tests__/GameOverlay.test.tsx
git commit -m "feat: lobby UI updates and local spin timing synchronization"
```

---

### Task 5: Edge Cases (Payment Retry, Timeout & Disconnects)

**Files:**
- Create: `src/app/api/game/timeout/route.ts`
- Create: `src/app/api/game/cancel/route.ts`
- Create: `src/app/api/game/leave/route.ts`
- Modify: `src/components/PaymentScreen.tsx`
- Modify: `src/components/WinScreen.tsx`
- Modify: `src/components/GameOverlay.tsx`
- Create: `src/app/api/game/__tests__/edgecases.test.ts`

- [ ] **Step 1: Write the failing test**
Create `src/app/api/game/__tests__/edgecases.test.ts`:
```typescript
import { expect, test } from 'vitest';
import { POST as timeoutRoute } from '../timeout/route';

test('payment timeout dissolves lobby', async () => {
  const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({tableId:'1'})});
  const res = await timeoutRoute(req);
  expect(res.status).toBe(200);
});
```

- [ ] **Step 2: Run test to verify it fails**
```bash
npm test
```

- [ ] **Step 3: Write minimal implementation**
Create `src/app/api/game/timeout/route.ts` and `src/app/api/game/cancel/route.ts` to delete the redis key and trigger `payment_timeout` / `lobby_closed`.
Create `src/app/api/game/leave/route.ts` to remove a guest from the `players` array in Redis.

Modify `src/components/PaymentScreen.tsx` to use `bg-rose-500`:
```tsx
  const [errorMsg, setErrorMsg] = useState('');
  // catch (error) { setErrorMsg('Payment Failed - Try Again'); }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-rose-500 text-white">
      <h2 className="text-4xl font-bold mb-4">You Lost!</h2>
      {errorMsg && <p className="mb-4 bg-black/20 p-2 rounded">{errorMsg}</p>}
      <button onClick={handlePay} className="bg-black py-3 px-6 rounded-lg font-bold">Pay Now</button>
    </div>
  );
```

Modify `src/components/WinScreen.tsx` to use `bg-emerald-500`:
```tsx
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-emerald-500 text-white">
      <h2 className="text-4xl font-bold mb-4">You Win!</h2>
      <p>Waiting for the loser to pay...</p>
    </div>
  );
```

Modify `src/components/GameOverlay.tsx`:
```tsx
  // Disconnect handling
  useEffect(() => {
    const handleUnload = () => { 
      if (isHost && gameState?.status === 'GATHERING') {
        fetch('/api/game/cancel', {method: 'POST', body: JSON.stringify({tableId})});
      } else if (!isHost && gameState?.status === 'GATHERING') {
        fetch('/api/game/leave', {method: 'POST', body: JSON.stringify({tableId, userId})});
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [isHost, gameState?.status, tableId, userId]);

  // Reliable 2-minute Payment Timeout (Host enforces)
  useEffect(() => {
    if (isHost && showResolution) {
      const timer = setTimeout(() => {
        fetch('/api/game/timeout', {method: 'POST', body: JSON.stringify({tableId})});
      }, 120000);
      return () => clearTimeout(timer);
    }
  }, [isHost, showResolution, tableId]);

  channel.bind('lobby_closed', () => setGameState(null));
  channel.bind('payment_timeout', () => setGameState(null));
```

- [ ] **Step 4: Run test to verify it passes**
```bash
npm test
```

- [ ] **Step 5: Commit**
```bash
git add src/app/api/game/timeout/route.ts src/app/api/game/cancel/route.ts src/app/api/game/leave/route.ts src/components/PaymentScreen.tsx src/components/WinScreen.tsx src/components/GameOverlay.tsx src/app/api/game/__tests__/edgecases.test.ts
git commit -m "feat: implement payment retry, robust timeout, and guest disconnect handling"
```
