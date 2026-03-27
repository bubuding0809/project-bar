# Drink Roulette MVP - Design Specification

## Overview
Drink Roulette is a social-gamified ordering feature embedded directly within a standard digital QR menu (e.g. TabSquare, Oddle) for bars. It turns the mundane act of ordering a round of drinks into a live, multiplayer social experience, driving drink volume through human psychology and gamification.

## Scope & Decisions
- **Core Mechanic:** Drink Roulette (Intra-table) - A wheel spins on everyone's phone, loser pays for the round.
- **Menu Integration:** The game acts as an upsell/feature *inside* a standard digital menu, not a standalone app.
- **Ordering Scope:** Custom quantity MVP. The host chooses the drink type (e.g., Tequila Shots) and configures the quantity using a stepper. *Note: The drink quantity is completely independent of the number of players that join (e.g., 6 players can play for 4 shots).*
- **Real-Time Engine:** WebSockets via Pusher or Vercel-compatible WebSocket layer.
- **Guardrails:** None for the MVP. Focus is on maximizing volume and frictionless entry. 
  - *Accepted Risks:* Troll/flake behavior (joining and bailing), and RNG spoilers (tech-savvy users inspecting the WebSocket payload to see they lost before the animation finishes).

## User Flow
1. **Browse:** Users scan a table QR code and land on a standard dark-mode digital menu.
2. **Discover:** A sticky, glowing "Play Drink Roulette 🎲" button floats at the bottom of the screen.
3. **Configure Stakes (Host):** Tapping the button opens a Bottom Sheet overlay. The user is prompted to set the stakes. They choose a drink type and set the custom quantity (e.g. 4x Tequila Shots). The UI shows the estimated total price.
4. **Lobby Creation:** Tapping "Create Game" checks Redis to ensure no active game exists for this `table_id`. If clear, the user becomes the Host and transitions into the Lobby waiting room. If a game already exists, they are routed to the exact same "enter nickname" join flow as guests (see step 6).
5. **Broadcast:** The backend broadcasts to all other active sessions at that table. Their UI dynamically updates with a banner: "Table is playing Drink Roulette - Join in!"
6. **Gather:** Friends tap the banner (or the floating button), enter an emoji/nickname, and join the lobby.
7. **Spin:** Once at least 2 people are in the lobby, the "Start Spin" button enables. (If users drop and the lobby falls to 1 player, the button dynamically disables). The Host taps it. The backend locks the lobby, rolls the RNG to determine the loser, and broadcasts a `spin_start` event containing the `loser_id` and a `target_end_time`. Clients run a 10-second CSS/Canvas wheel animation locally to conclude precisely at `target_end_time`.
8. **Late Joiners:** If a user submits their nickname after the backend has locked the lobby, they receive a "Game has already started" toast/modal.
9. **Reveal & Pay:** The wheel stops. The loser's screen turns red (`Rose 500`) and prompts Apple Pay / Google Pay. Everyone else sees a "You Win!" green confetti screen with a "Waiting for [Loser] to pay..." status.
10. **Fulfill:** Upon successful Stripe webhook receipt, the backend logs the order, broadcasts a `payment_success` event to the table, and the order is sent to the bar/POS.

## Edge Cases & Error Handling
- **Card Declined / Retries:** If the loser's payment fails or is declined, the UI shows a "Payment Failed - Try Again" state, allowing them to retry within the 2-minute window.
- **Loser Abandons Payment:** If the loser closes the app or fails to pay within a 2-minute timeout, the backend broadcasts a `payment_timeout` event. The lobby is dissolved, and users are returned to the menu.
- **Guest Disconnects:** If a guest disconnects while in the lobby, they are removed. If they disconnect during or after the spin, and they are the loser, they will see the payment screen upon reconnecting (if within the 2-minute window).
- **Host Disconnects Before Spin:** The backend dissolves the lobby and broadcasts a "Lobby Closed" event so anyone else can start a new game.
- **Host Disconnects After Spin:** The game proceeds normally on the server and for all remaining connected guests.
- **POS Integration Failure / Out of Stock:** If the POS API fails after successful Stripe payment (e.g. item is 86'd), the system relies on standard application error logging (e.g., Sentry) and the Stripe Dashboard for staff to manually review and issue a refund.

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
- **Real-Time Layer:** Pusher or similar Vercel-compatible serverless WebSocket provider.
- **Database:** Supabase or Vercel Postgres to persistently log the Game and Order lifecycle.
- **State Management:** Upstash Redis (Serverless Redis perfect for Vercel) tracking ephemeral `table_id` state.
- **Menu Data:** Static JSON for MVP. Pre-spin stock validation is deferred to POS fulfillment.
