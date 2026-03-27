# Drink Roulette MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Vercel-deployable mobile web app MVP for Drink Roulette featuring a digital menu, real-time WebSockets for synced spinning, and Stripe Apple Pay integration.

**Architecture:** Next.js App Router for frontend and API routes. Pusher (or similar serverless WebSocket) for real-time pub/sub to avoid long-running Node processes on Vercel. Upstash Redis for serverless state management of table sessions. Tailwind CSS for UI matching the generated OLED Dark Mode design system.

**Tech Stack:** Next.js (React), Tailwind CSS, Pusher (WebSockets), Upstash (Redis), Stripe Elements, Canvas/CSS Animations.

---

### Task 1: Scaffold Next.js Project & Design System

**Files:**
- Create: `package.json`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`
- Modify: `design-system/drink-roulette-mvp/MASTER.md` (Reference)

- [ ] **Step 1: Scaffold Next.js App**
  Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`

- [ ] **Step 2: Install core dependencies**
  Run `npm install pusher pusher-js @upstash/redis @stripe/stripe-js @stripe/react-stripe-js clsx tailwind-merge lucide-react`

- [ ] **Step 3: Configure Tailwind Theme**
  Update `tailwind.config.ts` to include the OLED Dark Mode colors from the spec (`#020617`, `#0F172A`, `#8B5CF6`, `#F43F5E`, `#10B981`) and add `Fredoka` font variables.

- [ ] **Step 4: Setup Global CSS**
  Update `src/app/globals.css` to set the dark theme background globally and import Google Fonts (Fredoka and Inter).

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "chore: scaffold nextjs app and configure tailwind theme"`

---

### Task 2: Build the Static Digital Menu UI

**Files:**
- Create: `src/components/MenuItem.tsx`, `src/app/table/[tableId]/page.tsx`, `src/data/menu.json`

- [ ] **Step 1: Create mock menu data**
  Create `src/data/menu.json` with 2 categories (Beers, Cocktails) and 4 mock items.

- [ ] **Step 2: Build MenuItem component**
  Create `MenuItem.tsx` matching the visual spec (Dark card, name, description, price).

- [ ] **Step 3: Build the Menu Page Layout**
  Implement `src/app/table/[tableId]/page.tsx` that maps over `menu.json` and displays the items. Include a static mock of the floating "Play Drink Roulette" CTA at the bottom.

- [ ] **Step 4: Run dev server to verify**
  Run `npm run dev` and visit `http://localhost:3000/table/4` to ensure the static UI matches the design system.

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "feat: build static digital menu ui"`

---

### Task 3: Implement Game Lobby & Redis State (API)

**Files:**
- Create: `src/app/api/game/create/route.ts`, `src/app/api/game/join/route.ts`, `src/lib/redis.ts`

- [ ] **Step 1: Setup Upstash Redis client**
  Create `src/lib/redis.ts` utilizing `@upstash/redis`. (Expects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` env vars).

- [ ] **Step 2: Create Game API**
  Implement `POST /api/game/create`. It takes a `tableId`, `roundId`, and `hostProfile` (userId, nickname/emoji). It sets a Redis key `table:{tableId}:game` to `{ status: 'GATHERING', host: hostProfile.userId, players: [hostProfile], roundId }`.

- [ ] **Step 3: Join Game API**
  Implement `POST /api/game/join`. Takes `tableId` and `playerProfile` (userId, nickname/emoji). Appends `playerProfile` to the players array in Redis if status is `GATHERING`.

- [ ] **Step 4: Write API Tests (Optional/Manual)**
  Use `curl` or Postman to test hitting the create and join routes and verifying the Redis state updates.

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "feat: implement redis state management for game lobby"`

---

### Task 4: Integrate Pusher (WebSockets) for Real-Time UI

**Files:**
- Create: `src/lib/pusher.ts`, `src/components/GameOverlay.tsx`
- Modify: `src/app/api/game/create/route.ts`, `src/app/api/game/join/route.ts`, `src/app/table/[tableId]/page.tsx`

- [ ] **Step 1: Setup Pusher Client & Server**
  Create `src/lib/pusher.ts` initializing Pusher server SDK and client SDK. (Expects Pusher env vars).

- [ ] **Step 2: Emit events from APIs**
  Update the Create and Join APIs to trigger a Pusher event `game-updated` on channel `table-{tableId}` with the new game state.

- [ ] **Step 3: Build GameOverlay component**
  Create `GameOverlay.tsx`. It subscribes to Pusher channel `table-{tableId}`. If a game is active (`status === 'GATHERING'`), it renders the Lobby UI over the menu, including a prompt for nickname/emoji before joining. If inactive, it hides.

- [ ] **Step 4: Add GameOverlay to Menu Page**
  Mount `<GameOverlay tableId={tableId} />` inside `src/app/table/[tableId]/page.tsx`. Verify that clicking "Play Roulette" calls the API, which updates Redis, triggers Pusher, and shows the lobby.

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "feat: integrate pusher for real-time game lobby syncing"`

---

### Task 5: The Wheel Spin Animation & State Sync

**Files:**
- Create: `src/components/SpinWheel.tsx`, `src/app/api/game/spin/route.ts`
- Modify: `src/components/GameOverlay.tsx`

- [ ] **Step 1: Create Spin API**
  Implement `POST /api/game/spin`. Updates Redis state to `SPINNING`. Randomly selects a loser from the `players` array. Triggers Pusher event `game-spinning` with the `loserId`.

- [ ] **Step 2: Build SpinWheel Component**
  Create `SpinWheel.tsx`. Use CSS conic-gradients and a keyframe animation with `ease-out`. It accepts the `loserId` prop to calculate the exact rotation degrees needed to land on that player's slice after exactly 10 seconds.

- [ ] **Step 3: Connect UI to Spin State**
  Update `GameOverlay`. When the Host clicks "Spin", call the Spin API. Listen for `game-spinning` via Pusher. When received, render `<SpinWheel>` and play the 10s animation simultaneously on all clients.

- [ ] **Step 4: Verify sync**
  Open two browser windows. Join the same table. Click spin on one, verify the animation starts and stops on the exact same person at the exact same time in both windows.

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "feat: implement synced wheel spin animation via pusher"`

---

### Task 6: Payment & Loser Screen Integration

**Files:**
- Create: `src/components/PaymentScreen.tsx`, `src/components/WinScreen.tsx`, `src/app/api/webhooks/stripe/route.ts`
- Modify: `src/components/GameOverlay.tsx`

- [ ] **Step 1: Build Payment UI**
  Create `PaymentScreen.tsx` using `@stripe/react-stripe-js` specifically configuring the Payment Request Button (Apple/Google Pay). Style it with the `Rose 500` danger background.

- [ ] **Step 2: Build Win UI**
  Create `WinScreen.tsx` with a simple Emerald green background and "You Win!" text.

- [ ] **Step 3: Connect Post-Spin UI**
  Update `GameOverlay`. After the 10s spin animation completes, check if `localUserId === loserId`. If true, show `PaymentScreen`. If false, show `WinScreen`. Update Redis state to `PAYMENT_PENDING`.

- [ ] **Step 4: Implement Stripe Webhook**
  Create `src/app/api/webhooks/stripe/route.ts`. Listen for `payment_intent.succeeded`. When received, update Redis state to `PAID` (which triggers a final Pusher event to close the game overlay for everyone), and log "Ticket sent to bar!".

- [ ] **Step 5: Commit**
  Run `git add . && git commit -m "feat: implement apple pay and post-spin resolution states"`

