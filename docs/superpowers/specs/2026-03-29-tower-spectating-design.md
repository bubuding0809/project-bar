# Tower Game: Real-Time Spectating

This document outlines the design for broadcasting the active player's bar fill percentage to spectators in real-time.

## Architecture & Components
- **Integration Points:**
  - `TowerHoldScreen.tsx` (Sender)
  - `TowerWatchScreen.tsx` (Receiver)
  - `/api/pusher/auth/route.ts` (New Auth Endpoint)
- **Protocol:** Pusher Client Events via WebSockets over a `private-` channel.
- **Operational Requirement:** "Enable client events" MUST be toggled ON in the Pusher App Dashboard for this feature to work.

## Data Flow & Interfaces
1. **Sender (`TowerHoldScreen.tsx`):**
   - The active player connects to a new `private-table-${tableId}` channel.
   - While the button is held, the client triggers a Pusher client event (`client-tower-sync`) at a throttled rate of 150ms to stay safely below Pusher's 10 msgs/sec limit.
   - **Payload Interface:** `{ userId: string, fill: number }`

2. **Receiver (`TowerWatchScreen.tsx`):**
   - The spectator connects to the same `private-table-${tableId}` channel.
   - Listens to the `client-tower-sync` event.
   - Upon receiving the event, it updates its local `fill` state with the received value, smoothly animating the `TowerMeter`.

3. **Pusher Auth Endpoint (`/api/pusher/auth/route.ts`):**
   - Required for Pusher clients to subscribe to `private-` channels and send client events.
   - Accepts POST requests from the Pusher client containing the `socket_id` and `channel_name`.
   - Reads the user's local `userId` from the request body.
   - For this demo game, we trust the provided `userId` and return a signed authorization token using the `serverPusher` instance.

## Error Handling
- **Auth Failures:** If a user fails to authenticate with the `/api/pusher/auth` endpoint, they cannot send or receive real-time sync events. They will rely on the static "Waiting..." view and server-side round completions.
- **Client Event Limits:** The 150ms throttle provides a safe margin to prevent hitting Pusher's message rate limits per connection due to JS event loop jitter.
- **Pusher Disconnection:** If a spectator disconnects, their bar will remain static. This is acceptable as the final result (success/bust) is broadcasted via reliable server-side state updates on the public channel.
- **Spoofing:** A malicious user could theoretically spoof the active player's `userId` and emit fake `client-tower-sync` events. This would only affect the visual bar for spectators and not the actual game outcome, which is computed server-side. For this demo application, this level of security is acceptable.

## Testing Strategy
- **Manual Verification:** Open two browser windows. Start a turn in Window A, hold the button, and verify the bar fills smoothly in Window B. Verify both connect to the `private-` channel successfully.
- **Unit Testing:** Write tests for the `/api/pusher/auth` endpoint to ensure it correctly authenticates valid socket IDs and channel names, and handles malformed requests appropriately.