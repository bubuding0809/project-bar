# Menu Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Menu component on the table page with the new proper menu components from `/menu`, keeping games intact.

**Architecture:** Table page (`/table/[tableId]`) remains a shell — it passes `tableId` to the Menu component. Menu component uses the new `MenuItem` from `@/components/menu/MenuItem`, along with `FloatingCartButton` and proper category navigation. Games overlay on top.

**Tech Stack:** Next.js 15, React, shadcn/ui, zustand

---

## File Structure

- **Modify:** `src/components/Menu.tsx` — refactor to use new MenuItem + FloatingCartButton
- **Modify:** `src/app/table/[tableId]/page.tsx` — pass tableId to Menu, remove old menu imports
- **No change:** `src/components/menu/MenuItem.tsx`, `src/components/menu/FloatingCartButton.tsx`, `/menu` page — these are already correct

---

## Task 1: Refactor Menu Component

**Files:**
- Modify: `src/components/Menu.tsx` (entire file)
- Reference: `src/app/menu/page.tsx` (for styling patterns)

- [ ] **Step 1: Write test for Menu component**

Create: `src/components/__tests__/Menu.test.tsx`

```tsx
import { render, screen } from '@testing-library/react';
import Menu from '../Menu';

jest.mock('@/data/menu', () => ({
  menuData: [
    {
      category: 'Cocktails',
      items: [
        { name: 'Orh Huey', price: 18.00, imageUrl: 'https://example.com/img.jpg' },
      ],
    },
  ],
}));

describe('Menu', () => {
  it('renders all menu items', () => {
    render(<Menu />);
    expect(screen.getByText('Orh Huey')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    render(<Menu />);
    expect(screen.getByText('Cocktails')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/components/__tests__/Menu.test.tsx`
Expected: FAIL (old Menu.tsx doesn't match expected structure)

- [ ] **Step 3: Replace Menu.tsx with new implementation**

Replace the entire content of `src/components/Menu.tsx` with:

```tsx
'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MenuItem } from '@/components/menu/MenuItem';
import { FloatingCartButton } from '@/components/menu/FloatingCartButton';
import { menuData } from '@/data/menu';
import { generateItemId } from '@/lib/utils';

interface MenuProps {
  tableId?: string;
}

export default function Menu({ tableId }: MenuProps) {
  const [activeCategory, setActiveCategory] = useState(menuData[0]?.category || '');

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto">
      {/* Sticky Header - matching /menu page styling */}
      <div className="sticky top-0 z-40 w-full bg-background border-b shadow-sm">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold">Bar Lorong 13</h1>
          <button className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
            <Search size={24} />
          </button>
        </div>
        
        {/* Category Tabs */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max px-4">
            {menuData.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(cat.category)}
                className={`text-sm font-semibold transition-colors px-4 py-3 border-b-2 ${
                  activeCategory === cat.category 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>

      {/* Menu List */}
      <main className="px-4 py-6 space-y-8">
        {menuData.map((cat) => (
          <div key={cat.category} id={`category-${cat.category}`} className="scroll-mt-[120px]">
            <h2 className="text-xl font-bold mb-4">{cat.category}</h2>
            <div className="space-y-0">
              {cat.items.map((item, index) => {
                const itemId = generateItemId(item.name);
                return (
                  <MenuItem
                    key={`${cat.category}-${index}`}
                    id={itemId}
                    title={item.name}
                    price={item.price as number}
                    description={item.description}
                    imgUrl={item.imageUrl || ''}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </main>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/components/__tests__/Menu.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/Menu.tsx src/components/__tests__/Menu.test.tsx
git commit -m "refactor: replace Menu component with new design"
```

---

## Task 2: Update Table Page to Use New Menu

**Files:**
- Modify: `src/app/table/[tableId]/page.tsx`

- [ ] **Step 1: Read current table page**

Review `src/app/table/[tableId]/page.tsx` to understand the current structure.

- [ ] **Step 2: Update table page imports**

Replace:
```tsx
import { menuData } from "@/data/menu";
import Menu from "@/components/Menu";
```

With:
```tsx
import Menu from "@/components/Menu";
```

Remove the `allItems` flattening and related state since it's no longer needed for the menu.

- [ ] **Step 3: Pass tableId to Menu component**

Replace `<Menu />` with:
```tsx
<Menu tableId={tableId} />
```

- [ ] **Step 4: Remove old menu-related state**

The table page has `selectedDrink`, `quantity`, etc. for the old roulette bottom sheet. Keep those since they're for games. But remove any menu data flattening.

- [ ] **Step 5: Run tests**

Run: `npm test -- src/app/table --passWithNoTests`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/app/table/[tableId]/page.tsx
git commit -m "feat: integrate new Menu component with tableId support"
```

---

## Task 3: Verify Integration

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test table page**

Navigate to `http://localhost:3000/table/test123` and verify:
- Menu displays with proper styling (category tabs, search bar)
- Menu items link to item detail pages
- Floating cart button appears when items would be added
- Games (Roulette, Tower) still work

- [ ] **Step 3: Test menu page separately**

Navigate to `http://localhost:3000/menu` and verify it still works independently.

- [ ] **Step 4: Test item detail → cart flow**

Click a menu item → item detail page → add to cart → cart page → verify all works.

---

## Task 4: Visual Verification with agent-browser

**Prerequisites:** 
- `agent-browser` CLI installed: `npm i -g agent-browser`
- Chrome browser installed (for CDP connection)

**Files:**
- No code files modified — this is a verification task

- [ ] **Step 1: Ensure dev server is running**

In a separate terminal:
```bash
npm run dev
```

- [ ] **Step 2: Take screenshot of table page menu**

```bash
agent-browser open http://localhost:3000/table/test123
agent-browser wait --load networkidle
agent-browser screenshot ./screenshots/table-menu-before.png
```

- [ ] **Step 3: Navigate menu and capture key screens**

```bash
# Click through category tabs
agent-browser snapshot -i
# Note the refs for Cocktails, Food Menu, Promotions tabs

# Take screenshot after clicking different categories
agent-browser screenshot ./screenshots/table-menu-cocktails.png
```

- [ ] **Step 4: Compare against Pencil design spec**

Reference: `Design/Pencil/Drunk App Screens.pen` — frame `[M1] Main Menu`

Key visual elements to verify:
- [ ] Header: "Bar Lorong 13" title + search icon
- [ ] Category tabs: Cocktails, Food Menu, Promotions (pill-shaped active state)
- [ ] Menu items: Image on right, title + price + description on left
- [ ] Floating cart button at bottom (should be hidden when cart empty)
- [ ] Bottom navigation bar

- [ ] **Step 5: Test item detail flow**

```bash
# Click first menu item
agent-browser click @eX  # Use ref from snapshot
agent-browser wait --load networkidle
agent-browser screenshot ./screenshots/item-detail.png
```

Verify:
- [ ] Hero image at top
- [ ] Back button (ChevronLeft)
- [ ] Title + price
- [ ] Ice level selector
- [ ] Sugar level selector
- [ ] Quantity controls
- [ ] Add to cart button

- [ ] **Step 6: Test cart page**

```bash
agent-browser open http://localhost:3000/cart
agent-browser wait --load networkidle
agent-browser screenshot ./screenshots/cart-page.png
```

Verify:
- [ ] Cart items listed with quantities
- [ ] Total price displayed
- [ ] Payment info card
- [ ] Submit Order button

- [ ] **Step 7: Close browser**

```bash
agent-browser close
```

- [ ] **Step 8: Commit screenshots**

```bash
mkdir -p screenshots
git add screenshots/
git commit -m "docs: add visual verification screenshots"
```

---

## Summary of Changes

| File | Action |
|------|--------|
| `src/components/Menu.tsx` | Replace entirely with new implementation |
| `src/app/table/[tableId]/page.tsx` | Pass tableId prop, clean up old imports |
| `src/components/__tests__/Menu.test.tsx` | Create new test |

**No changes needed to:**
- `src/components/menu/MenuItem.tsx` — already correct
- `src/components/menu/FloatingCartButton.tsx` — already correct
- `src/app/menu/page.tsx` — already correct
- `src/store/useCartStore.ts` — already correct
