# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Run all tests with vitest
npx vitest run src/path/to/file.test.ts  # Run a single test file
```

## Architecture

**Drink Roulette MVP** — a mobile web app where bar patrons at a table scan a QR code, play a roulette wheel game, and the loser pays for a round of drinks via Apple/Google Pay.

### Tech Stack
- **Next.js 16** (App Router) + React 19 + TypeScript
- **Pusher** — real-time WebSocket pub/sub (avoids long-running server processes on Vercel)
- **Upstash Redis** — serverless state management for table game sessions
- **Stripe** — payment processing (currently stubbed; webhook at `/api/webhooks/stripe`)
- **Tailwind CSS v4** + custom OLED dark theme

### Request/Data Flow

1. Host visits `/table/[tableId]` → sees the bar menu + "Play Drink Roulette" CTA
2. Host clicks CTA → `POST /api/game/create` → Redis key `table:{tableId}:game` created with `status: 'GATHERING'` → Pusher event `game-updated` broadcast on channel `table-{tableId}`
3. Guests on same page see `GameOverlay` appear (via Pusher) → enter nickname/emoji → `POST /api/game/join`
4. Host clicks "Spin Wheel" → `POST /api/game/spin` → loser selected randomly → Pusher `spin_start` event with `{ loserId, targetEndTime }` broadcast to all clients
5. All clients start spin animation locally, synchronized via `targetEndTime`
6. Loser sees `PaymentScreen`, winners see `WinScreen` → loser pays via `POST /api/game/pay` → Pusher `game-paid` closes overlay for everyone

### Key Files

| Path | Purpose |
|------|---------|
| `src/app/table/[tableId]/page.tsx` | Main table page: menu + game creation |
| `src/components/GameOverlay.tsx` | Real-time game state management; renders lobby/spin/payment/win screens |
| `src/components/SpinWheel.tsx` | CSS animation wheel, driven by `loserId` prop |
| `src/components/PaymentScreen.tsx` | Loser's payment UI; 2-min timeout enforced client-side |
| `src/lib/pusher-server.ts` | Server Pusher instance |
| `src/lib/pusher-client.ts` | Singleton client Pusher instance (browser only) |
| `src/lib/redis.ts` | Upstash Redis singleton |
| `src/types/game.ts` | `GameState` and `PlayerProfile` types |
| `src/data/menu.ts` | Full bar menu data |

### API Routes (`src/app/api/game/`)

| Route | Action |
|-------|--------|
| `create` | Creates new game in Redis, broadcasts `game-updated` |
| `join` | Adds player to `players[]`, broadcasts `game-updated` |
| `spin` | Picks random loser, sets `status: 'SPINNING'`, broadcasts `spin_start` with `targetEndTime` |
| `pay` | Sets `status: 'PAID'`, broadcasts `game-paid` |
| `cancel` | Host disconnects; cancels game, broadcasts `lobby_closed` |
| `leave` | Guest disconnects during `GATHERING` |
| `timeout` | 2-min payment timeout enforced by host client; broadcasts `payment_timeout` |
| `[tableId]` | GET current game state from Redis |

### Design System

See `design-system/drink-roulette-mvp/MASTER.md` for the full design system spec.

- **Style:** Retro-Futurism / OLED dark mode (`#020617` background)
- **Fonts:** `font-display` = Fredoka (headings), `font-sans` = Inter (body)
- **Custom colors:** `primary` (#E11D48), `neon-violet` (#8B5CF6), `neon-rose` (#F43F5E), `neon-emerald` (#10B981)
- **Custom shadows:** `shadow-neon-violet`, `shadow-neon-rose`, `shadow-neon-emerald`
- **Anti-patterns:** No emojis as icons (use Lucide SVG), all clickable elements need `cursor-pointer`, transitions 150–300ms

### Required Environment Variables

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
PUSHER_APP_ID
NEXT_PUBLIC_PUSHER_KEY
PUSHER_SECRET
NEXT_PUBLIC_PUSHER_CLUSTER
```

### Pusher Channel Convention

Each table uses channel `table-{tableId}`. Events: `game-updated`, `spin_start`, `game-paid`, `lobby_closed`, `payment_timeout`.

### Path Alias

`@/` maps to `src/` (configured in both `tsconfig.json` and `vitest.config.ts`).
