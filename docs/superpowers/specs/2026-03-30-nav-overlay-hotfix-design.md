# Hotfix: Navigation and Overlay Button Fixes

## Status
- **Author:** AI Assistant
- **Created:** 2026-03-30
- **Reviewed:** Pending

## Overview

Three fixes for the table view navigation:
1. Remove overlay CTA buttons for games (Games tab already provides this)
2. Auto-scroll top nav category tabs to show active section
3. Ensure bottom nav appears on all relevant views

## Changes

### 1. Remove Game Overlay CTA Buttons

**File:** `src/app/table/[tableId]/page.tsx`

**Change:** Remove the three floating bottom CTA buttons (lines 184-207) and their associated bottom sheet modals (Roulette, Tower, Barrel setup sheets).

**Rationale:** Games are now accessible via the Games tab in BottomNav. The overlay buttons are redundant and create duplicate entry points.

### 2. Top Nav Auto-Scroll to Active Tab

**File:** `src/components/Menu.tsx`

**Change:** When user scrolls to a menu section, the category tab for that section should scroll into view (horizontally) if not already visible.

**Implementation:**
- Track active section via Intersection Observer or scroll position
- Call `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })` on the active tab ref when section changes

**Rationale:** Currently the top nav stays fixed but doesn't adjust when user scrolls to a far-down section, making it unclear which category is active.

### 3. Bottom Nav on All Views

**Files:**
- `src/app/table/[tableId]/cart/page.tsx` - Add `<BottomNav />`
- `src/app/table/[tableId]/games/page.tsx` - Create with `<BottomNav />` + GamesHub
- `src/app/table/[tableId]/profile/page.tsx` - Create placeholder with `<BottomNav />`

**Change:** BottomNav should be present on all table sub-pages (menu, games, cart, profile).

**Rationale:** Users should always have access to navigation regardless of which view they're in.

## Technical Notes

- BottomNav is already implemented at `src/components/menu/BottomNav.tsx`
- Uses query params for view switching: `?view=menu`, `?view=games`, etc.
- GamesHub component already exists at `src/components/GamesHub.tsx`

## Verification

- [ ] Overlay CTA buttons removed from table page
- [ ] Top nav scrolls to active tab when switching sections
- [ ] BottomNav visible on cart page
- [ ] BottomNav visible on games page
- [ ] BottomNav visible on profile placeholder page
