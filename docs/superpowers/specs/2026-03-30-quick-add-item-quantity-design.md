# Quick Add Item Quantity +/- Design

**Date:** 2026-03-30
**Status:** Approved

## Overview

Add plus/minus quantity controls to the quick add button on menu item cards in the Main Menu (M1) screen. This allows users to increase or decrease item quantities directly from the menu list without navigating to the item detail page.

## UI Behavior

| Cart Quantity | Visual State |
|--------------|--------------|
| 0 | `+` button only |
| 1 | `+` button only |
| 2+ | `-` `N` `+` badge |

### Interaction Flow

1. **First tap (+)**: Adds item with qty 1 → UI stays as `+` button
2. **Second tap (+)**: Item qty becomes 2 → UI transforms to `- 2 +`
3. **Tap -**: Decreases qty by 1. If qty becomes 1 → UI reverts to `+` only
4. **Tap - at qty 1**: Removes item from cart → UI reverts to `+` only

## Visual Design

### Quick Add Badge (Hybrid State)

- **Container**: Pill-shaped badge
  - `cornerRadius: "$--radius-pill"` (full pill shape)
  - `height: 32px`
  - `width: auto` (fits content)
  - `shadow: blur: 4, offset: {x:0, y:2}, color: "#00000080"`
- **Layout**: Horizontal flex with `-` `N` `+` centered, gap between elements
- **Position**: Bottom-right corner of menu item image, overlapping by 12px (same position as current `+` button)

### Buttons

- **Plus/Minus icons**: lucide `plus` and `minus`, size 14px
- **Touch target**: Minimum 32x32px for accessibility
- **Hover state**: `hover:bg-muted` transition (matching current design)

## Component Changes

### `src/components/menu/MenuItem.tsx`

**Props changes:**
- No new props required - will read from cart store directly

**State:**
- Use `useCartStore` to get current item quantity in cart
- Item identified by `id` (items with same id but different customizations are treated as separate entries - quick add always uses no customizations)

**Logic:**
- Determine UI state based on cart quantity:
  - `quantity === 0 or 1` → Show `+` button
  - `quantity >= 2` → Show `- N +` badge
- Handle click:
  - `+` → Call `addItem({ id, title, price, quantity: 1 })`
  - `-` → Call `decrementItem(cartItemId)` with the cart item's cartItemId

### `src/store/useCartStore.ts`

**New actions needed:**

```typescript
updateItemQuantity: (cartItemId: string, quantity: number) => void
decrementItem: (cartItemId: string) => void
```

**`updateItemQuantity` behavior:**
- If `quantity <= 0`, remove item from cart
- Otherwise, update item quantity

**`decrementItem` behavior:**
- Reduce quantity by 1
- If result <= 0, remove item from cart

**Implementation note:** Items added via quick add have `customizations: undefined`. When looking up items by id for quantity display, match items with `customizations: undefined`.

## Technical Approach

### Cart Store Lookup

Add a selector to find cart item by menu item id (for items without customizations):

```typescript
getItemById: (state: CartState, menuItemId: string) => CartItem | undefined
```

This selector should find the cart item where `item.id === menuItemId` AND `item.customizations === undefined`.

### State Subscription

`MenuItem` component should subscribe to cart store to re-render when quantity changes:

```typescript
const cartItem = useCartStore(state => 
  state.items.find(item => item.id === id && item.customizations === undefined)
);
const quantity = cartItem?.quantity ?? 0;
```

### Animation

Badge transformation should use CSS transitions:
- Scale from 0 to 1 when appearing
- Fade transition for smooth state change
- Duration: 150-200ms

## File Changes

| File | Change |
|------|--------|
| `src/store/useCartStore.ts` | Add `getItemById` selector, `updateItemQuantity` and `decrementItem` actions |
| `src/components/menu/MenuItem.tsx` | Update UI to show +/- controls, read from cart store |
| `src/components/menu/MenuItem.test.tsx` | Add tests for quantity controls |

## Testing

1. **Unit tests for cart store**:
   - `updateItemQuantity` with qty > 0 updates quantity
   - `updateItemQuantity` with qty <= 0 removes item
   - `decrementItem` reduces quantity by 1
   - `decrementItem` at qty 1 removes item

2. **Component tests for MenuItem**:
   - Shows `+` when quantity is 0 or 1
   - Shows `- N +` when quantity is 2+
   - Clicking `+` adds item to cart
   - Clicking `-` decreases quantity (or removes if qty 1)
   - Component re-renders when cart quantity changes

## Notes

- Quick add always adds items with `customizations: undefined`
- Multiple quick-add entries for the same item (same id, no customizations) will be aggregated into a single cart entry
- The design follows the existing pill button style from the Pencil design file
