# Drink Roulette MVP - Design Specification

## Overview
Drink Roulette is a social-gamified ordering feature embedded directly within a standard digital QR menu (e.g. TabSquare, Oddle) for bars. It turns the mundane act of ordering a round of drinks into a live, multiplayer social experience, driving drink volume through human psychology and gamification.

## Scope & Decisions
- **Core Mechanic:** Drink Roulette (Intra-table) - A wheel spins on everyone's phone, loser pays for the round.
- **Menu Integration:** The game acts as an upsell/feature *inside* a standard digital menu, not a standalone app.
- **Ordering Scope:** Pre-set rounds only (e.g. "6 Tequila Shots - $40"). No custom cart building for the MVP.
- **Real-Time Engine:** WebSockets via Pusher or Vercel-compatible WebSocket layer (keeping architecture lean and Vercel-deployable without needing a dedicated Node.js server container).
- **Guardrails:** None for the MVP. Focus is on maximizing volume and frictionless entry.

## User Flow
1. **Browse:** Users scan a table QR code and land on a standard dark-mode digital menu.
2. **Discover:** A glowing, sticky "Play Drink Roulette 🎰" button sits at the bottom of the screen.
3. **Host:** The first person to tap the button enters the Game Lobby and selects a pre-set round.
4. **Broadcast:** The backend broadcasts to all other active sessions at that table. Their UI dynamically updates with a banner: "Table is playing Roulette - Join in!"
5. **Gather:** Friends tap the banner, enter an emoji/nickname, and join the lobby.
6. **Spin:** The Host taps "Spin". A 10-second CSS/Canvas wheel animation syncs across all connected phones using WebSockets.
7. **Reveal & Pay:** The wheel stops. The loser's phone turns red (`Rose 500`) and prompts Apple Pay. Everyone else sees a "You Win!" confetti screen.
8. **Fulfill:** Upon successful Stripe webhook receipt, the order is sent to the bar/POS.

## UI/UX Design System
*Persisted in `design-system/drink-roulette-mvp/MASTER.md`*

- **Style:** Cyberpunk / OLED Dark Mode (Optimized for low-light bar environments).
- **Colors:** 
  - Background: `Slate 950` (`#020617`) and `Slate 900` (`#0F172A`)
  - Primary Accent (Game UI): `Violet 500` (`#8B5CF6`) with glowing drop shadows.
  - Danger/Loser Screen: `Rose 500` (`#F43F5E`)
  - Success/Win Screen: `Emerald 500` (`#10B981`)
- **Typography:**
  - Game Elements (Headers, Buttons): `Fredoka` (Playful, rounded, arcade-feel)
  - Menu/Body Text: `Inter` (High legibility sans-serif)
- **Animation Rules:**
  - Wheel spin must use an `ease-out` timing function to slow down naturally.
  - Respect `prefers-reduced-motion` for accessibility.

## Architecture (Vercel Optimized)
- **Frontend & API:** Next.js (Vercel deployment)
- **Styling:** Tailwind CSS
- **Payments:** Stripe Elements (Apple Pay / Google Pay heavily prioritized)
- **Real-Time Layer:** Pusher or similar Vercel-compatible serverless WebSocket provider (avoiding long-running Node.js/Socket.io servers for now to keep deployment trivial).
- **State Management:** Upstash Redis (Serverless Redis perfect for Vercel) tracking `table_id` state.
- **Menu Data:** Static JSON for the MVP pre-set rounds.
