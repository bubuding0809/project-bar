# M-Series Mobile Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the complete M1 through M5 mobile menu flow using Next.js, Tailwind, and shadcn/ui.

**Architecture:** A mobile-first Next.js application that uses a global Zustand store to manage cart state across the five different views. The views can be simple client components toggled via state or standard Next.js routes. For simplicity in a prototype app feel, we'll build them as standard routes within the Next.js App Router (e.g., `/menu`, `/menu/[id]`, `/cart`, `/payment`, `/confirmed`).

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, shadcn/ui, Zustand (for state management), lucide-react (for icons).

---

### Task 1: Setup Workspace & Global State

**Files:**
- Create: `components.json` (via shadcn init)
- Create: `src/store/useCartStore.ts`
- Create: `src/store/useCartStore.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Initialize shadcn/ui and install base dependencies**
Run: `npx shadcn@latest init -d`
Run: `npm install zustand lucide-react`
Expected: shadcn is initialized successfully with `components.json` generated.

- [ ] **Step 2: Add required shadcn components**
Run: `npx shadcn@latest add button card separator scroll-area radio-group --yes`
Expected: Components are installed in `src/components/ui/`.

- [ ] **Step 3: Write failing test for Zustand Cart Store**
Create `src/store/useCartStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should add an item to the cart', () => {
    const store = useCartStore.getState();
    store.addItem({ id: '1', title: 'Aroi Cha Yen', price: 18.00, quantity: 1 });
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().totalPrice()).toBe(18.00);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**
Run: `npm test`
Expected: FAIL due to missing `useCartStore.ts`.

- [ ] **Step 5: Write minimal implementation for Cart Store**
Create `src/store/useCartStore.ts`:
```typescript
import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  customizations?: { iceLevel?: string; sugarLevel?: string };
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
```

- [ ] **Step 6: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**
```bash
git add package.json package-lock.json components.json src/components/ui/ src/store/
git commit -m "chore: initialize shadcn and cart store"
```

---

### Task 2: Build Shared Components (MenuItem & BottomNav)

**Files:**
- Create: `src/components/menu/MenuItem.tsx`
- Create: `src/components/menu/MenuItem.test.tsx`
- Create: `src/components/menu/BottomNav.tsx`

- [ ] **Step 1: Write failing test for MenuItem**
Create `src/components/menu/MenuItem.test.tsx`:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MenuItem } from './MenuItem';

describe('MenuItem Component', () => {
  it('renders item title and price', () => {
    render(<MenuItem title="Aroi Cha Yen" price={18.00} imgUrl="/placeholder.png" />);
    expect(screen.getByText('Aroi Cha Yen')).toBeDefined();
    expect(screen.getByText('$18.00')).toBeDefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test`
Expected: FAIL due to missing `MenuItem.tsx`.

- [ ] **Step 3: Write minimal implementation for MenuItem and BottomNav**
Create `src/components/menu/MenuItem.tsx`:
```tsx
import React from 'react';
import { Plus } from 'lucide-react';

interface MenuItemProps {
  title: string;
  price: number;
  description?: string;
  imgUrl: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ title, price, description, imgUrl }) => {
  return (
    <div className="flex justify-between gap-4 py-4 border-b">
      <div className="flex flex-col gap-1 justify-center">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <span className="font-medium mt-1">${price.toFixed(2)}</span>
      </div>
      <div className="relative w-[104px] h-[104px] rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img src={imgUrl} alt={title} className="object-cover w-full h-full" />
        <button className="absolute bottom-[-12px] right-2 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%]">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
```
Create `src/components/menu/BottomNav.tsx` (simplified mock):
```tsx
import React from 'react';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

export const BottomNav = () => (
  <div className="fixed bottom-0 left-0 w-full bg-background border-t h-14 flex items-center justify-around px-4">
    <Home size={24} />
    <Search size={24} />
    <ShoppingCart size={24} />
    <User size={24} />
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/components/menu/
git commit -m "feat: add MenuItem and BottomNav components"
```

---

### Task 3: Implement [M1] Main Menu Screen

**Files:**
- Create: `src/app/menu/page.tsx`
- Create: `src/components/menu/FloatingCartButton.tsx`

- [ ] **Step 1: Write FloatingCartButton**
Create `src/components/menu/FloatingCartButton.tsx` checking global store items.
```tsx
'use client';
import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';

export const FloatingCartButton = () => {
  const { items, totalPrice } = useCartStore();
  if (items.length === 0) return null;
  return (
    <div className="fixed bottom-20 left-0 w-full px-6 flex justify-center z-50">
      <Button className="w-full max-w-[345px] rounded-full h-14 text-base font-semibold shadow-lg">
        Cart [{items.length} Items] — ${totalPrice().toFixed(2)}
      </Button>
    </div>
  );
};
```

- [ ] **Step 2: Construct the Main Menu Page**
Create `src/app/menu/page.tsx`:
Implement the layout with Header (Bar Lorong 13), ScrollArea for tabs (Cocktails, Food Menu, etc.), mapped `MenuItem` list using hardcoded mock data matching the design spec, `FloatingCartButton`, and `BottomNav`.

- [ ] **Step 3: Run dev server and visually verify**
Run: `npm run dev`
Expected: The app renders the menu layout at `/menu`.

- [ ] **Step 4: Commit**
```bash
git add src/app/menu/ src/components/menu/FloatingCartButton.tsx
git commit -m "feat: implement M1 Main Menu screen"
```

---

### Task 4: Implement [M2] Item Detail Screen

**Files:**
- Create: `src/app/menu/[id]/page.tsx`

- [ ] **Step 1: Construct the Item Detail Page**
Create `src/app/menu/[id]/page.tsx`:
Add a "Back" ghost button. Add a hero image placeholder. Add Title, Price, Description. Implement "Ice Level" and "Sugar Level" using shadcn `RadioGroup` or custom rounded pill buttons. Add a sticky "Add to Cart" button at the bottom.
Hook up the "Add to Cart" button to `useCartStore.getState().addItem({...})`.

- [ ] **Step 2: Run dev server and verify**
Expected: Clicking an item in `/menu` navigates to `/menu/[id]`. Adding an item updates the floating cart.

- [ ] **Step 3: Commit**
```bash
git add src/app/menu/[id]/
git commit -m "feat: implement M2 Item Detail screen"
```

---

### Task 5: Implement [M3] Cart Screen

**Files:**
- Create: `src/app/cart/page.tsx`

- [ ] **Step 1: Construct the Cart Page**
Create `src/app/cart/page.tsx`:
Read items from `useCartStore`. Render the list of items with their individual prices, and the "Total (inc. GST)" row. Add the "Payment at End of Night" informational card. Add a sticky "Submit Order to Tab" button that routes to `/payment`.

- [ ] **Step 2: Verify in browser**
Expected: The cart renders selected items and correctly calculates totals.

- [ ] **Step 3: Commit**
```bash
git add src/app/cart/
git commit -m "feat: implement M3 Cart screen"
```

---

### Task 6: Implement [M4] Payment Screen

**Files:**
- Create: `src/app/payment/page.tsx`

- [ ] **Step 1: Construct the Payment Page**
Create `src/app/payment/page.tsx`:
Render the summary cost breakdown. Render the "Apple Pay" and "VISA ending in 4242" interactive cards. Render the auto-charge alert at the bottom. Make clicking a payment method transition to the confirmed screen.

- [ ] **Step 2: Verify in browser**
Expected: Clicking a payment method redirects to `/confirmed`.

- [ ] **Step 3: Commit**
```bash
git add src/app/payment/
git commit -m "feat: implement M4 Payment screen"
```

---

### Task 7: Implement [M5] Confirmed Screen

**Files:**
- Create: `src/app/confirmed/page.tsx`

- [ ] **Step 1: Construct the Confirmed Page**
Create `src/app/confirmed/page.tsx`:
Render the large Checkmark icon, "Order Submitted" title, and success text.
Render a "Back to Menu" button that clears the cart (`useCartStore.setState({ items: [] })`) and routes back to `/menu`.

- [ ] **Step 2: Verify in browser**
Expected: Displays success state and correctly clears the cart when navigating back.

- [ ] **Step 3: Commit**
```bash
git add src/app/confirmed/
git commit -m "feat: implement M5 Confirmed screen"
```
