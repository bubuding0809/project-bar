# Games Navigation & Segregation Spec

**Date:** 2026-03-30
**Status:** Draft

## Problem

Games currently lack proper screen segregation. When tapping GAMES in the bottom nav, the user sees `[G0.1] Games Hub` with two large overlay buttons over menu content, rather than a clean game list. No distinct Games navigation stack exists.

## Design

### Screen Structure

| Screen | ID | Purpose |
|--------|----|---------|
| Games Hub | `[G0.1]` | Entry point showing available games list |
| Croc Teeth | `[G1]` | Game screen |
| Shot Roulette | `[G2]` | Game screen |
| Send a Drink | `[G3]` | Game screen |
| Market Crash | `[G5]` | Game screen |
| Gift Sent | `[G4]` | Confirmation/state screen |

### Navigation Flow

```
Bottom Nav                    Games Hub [G0.1]
┌─────────────────────┐       ┌─────────────────────┐
│ HOME  MENU  GAMES   │  →   │ Games list (cards)  │
│            PROFILE  │       │  - Croc Teeth       │
└─────────────────────┘       │  - Shot Roulette     │
                              │  - Send a Drink      │
                              │  - Market Crash      │
                              └─────────────────────┘
                                    │
                                    ▼
                              Game Screen [G1/G2/G3/G5]
                              ┌─────────────────────┐
                              │ ← Exit Game         │
                              │                      │
                              │   [Game Content]    │
                              │                      │
                              └─────────────────────┘
```

### Bottom Nav Behavior

**When on HOME / MENU / GAMES / PROFILE tabs:**
- Standard 4-item nav: HOME | MENU | GAMES | PROFILE
- GAMES item shows `lucide:dice-5` icon

**When inside a Game screen (G1, G2, G3, G5):**
- Standard 4-item nav persists
- GAMES remains highlighted

### Games Hub [G0.1] Layout

- Status bar
- Header: "Games" title
- Game cards list (not overlay buttons):
  - Each card shows: game icon, game name, brief description
  - Tap → navigate to respective game screen
- Cart FAB (above bottom nav)
- Bottom nav (GAMES highlighted)

### Screen IDs

All screens use existing IDs in the pen file:
- `wkcOo` = [G0.1] Games Hub
- `na8rx` = [G1] Croc Teeth
- `vTkIg` = [G2] Shot Roulette
- `0UwIZ` = [G3] Send a Drink
- `sDzMH` = [G5] Market Crash
- `eMZFX` = [G4] Gift Sent

## Changes Required

### In [G0.1] Games Hub:
1. Remove the 2 overlay game buttons currently on menu context
2. Show game list as primary content (cards for Croc Teeth, Shot Roulette, Send a Drink, Market Crash)
3. Ensure bottom nav shows GAMES as selected

### All Game Screens:
- Ensure bottom nav persists (HOME | MENU | GAMES | PROFILE)
- "← Exit Game" back action returns to Games Hub [G0.1], not to previous tab context

## Notes

- Gift Sent [G4] is a success/confirmation state — back returns to Home or Games Hub (TBD)
- Game-specific elements (player count, live banners) preserved as-is in respective screens
