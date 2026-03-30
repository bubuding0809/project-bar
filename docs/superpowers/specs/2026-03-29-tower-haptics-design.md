# Tower Game: Haptics Integration

This document outlines the design for adding tactile feedback to the Tower Game using the `web-haptics` library.

## Architecture & Components
- **Library:** `web-haptics` (installed via npm).
- **Integration Point:** `useTowerHaptics.ts` (new custom hook) used by `TowerHoldScreen.tsx`.
- **Logic:** To ensure isolation and clarity, we will wrap the library's `web-haptics` logic in a custom `useTowerHaptics` hook.
  - When the user starts holding, `startEngine()` triggers a continuous vibration pattern (e.g., `[50, 50, 50, 50...]`).
  - When the bar crosses the Danger Zone (>80%), `startDanger()` triggers a faster/heavier continuous pattern (e.g., `[25, 25, 25, 25...]`).
  - Upon a "bust" (100%), `bust()` triggers a heavy, long vibration (e.g., `[500]`).
  - Upon a successful release, `success()` triggers a pleasant sequence (e.g., `[50, 100, 50]`).
  - When the turn ends or is interrupted, `stop()` cancels any ongoing vibrations.

## Data Flow & Interfaces
- **`useTowerHaptics` Hook Interface:**
  - `startEngine()`: Starts a standard repeating pattern.
  - `startDanger()`: Starts the high-intensity repeating pattern.
  - `bust()`: Triggers the failure vibration.
  - `success()`: Triggers the success vibration sequence.
  - `stop()`: Cancels all vibrations.
- The `web-haptics` API is isolated entirely within this hook.

## Error Handling
- **Unsupported Devices (iOS / Desktop):** iOS Safari explicitly does not support the Web Vibration API. The `web-haptics` library gracefully no-ops on unsupported devices. The custom hook will also ensure any errors are caught so the game remains fully playable.

## Testing Strategy
- **Manual Verification:** Test on a supported mobile device (Android) to verify the vibration patterns map correctly to the visual fill state and danger thresholds.
- **Unit Testing:** Write a test for `useTowerHaptics` to verify it calls the underlying `web-haptics` functions correctly when they are available, and fails silently when they are not.