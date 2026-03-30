# Quick Add Item Quantity +/- Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add +/- quantity controls to the quick add button on menu item cards, allowing users to adjust quantities directly from the menu list.

**Architecture:** Zustand cart store manages cart state. MenuItem component subscribes to cart store to display current quantity and renders +/- controls based on quantity state. Quick add always uses `customizations: undefined`.

**Tech Stack:** React, Zustand, Tailwind CSS, lucide-react icons

---

## Task 1: Add `getItemById` selector, `updateItemQuantity` and `decrementItem` actions to cart store

**Files:**
- Modify: `src/store/useCartStore.ts`
- Test: `src/store/useCartStore.test.ts`

- [ ] **Step 1: Write failing tests for `getItemById` selector**

Add to `src/store/useCartStore.test.ts`:

```typescript
it('should find item by id and undefined customizations', () => {
  useCartStore.getState().addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1 });
  useCartStore.getState().addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1, customizations: { iceLevel: 'Normal' } });
  
  const result = useCartStore.getState().getItemById('1');
  
  expect(result).toBeDefined();
  expect(result?.id).toBe('1');
  expect(result?.customizations).toBeUndefined();
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/store/useCartStore.test.ts`
Expected: FAIL with "getItemById is not a function"

- [ ] **Step 3: Implement `getItemById` selector in cart store**

Add to `src/store/useCartStore.ts` before the `create` call:

```typescript
export const getItemById = (state: CartState, menuItemId: string): CartItem | undefined =>
  state.items.find(item => item.id === menuItemId && item.customizations === undefined);
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/store/useCartStore.test.ts`
Expected: PASS

- [ ] **Step 5: Write failing tests for `updateItemQuantity` and `decrementItem`**

Add to `src/store/useCartStore.test.ts`:

```typescript
it('should update item quantity', () => {
  const store = useCartStore.getState();
  store.addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1 });
  const cartItem = useCartStore.getState().items[0];
  
  store.updateItemQuantity(cartItem.cartItemId, 5);
  
  expect(useCartStore.getState().items[0].quantity).toBe(5);
});

it('should remove item when updateItemQuantity is called with 0', () => {
  const store = useCartStore.getState();
  store.addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1 });
  const cartItem = useCartStore.getState().items[0];
  
  store.updateItemQuantity(cartItem.cartItemId, 0);
  
  expect(useCartStore.getState().items.length).toBe(0);
});

it('should decrement item quantity', () => {
  const store = useCartStore.getState();
  store.addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 3 });
  const cartItem = useCartStore.getState().items[0];
  
  store.decrementItem(cartItem.cartItemId);
  
  expect(useCartStore.getState().items[0].quantity).toBe(2);
});

it('should remove item when decrementItem is called at quantity 1', () => {
  const store = useCartStore.getState();
  store.addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1 });
  const cartItem = useCartStore.getState().items[0];
  
  store.decrementItem(cartItem.cartItemId);
  
  expect(useCartStore.getState().items.length).toBe(0);
});
```

- [ ] **Step 6: Run tests to verify they fail**

Run: `npm test -- src/store/useCartStore.test.ts`
Expected: FAIL with "updateItemQuantity is not a function" or similar

- [ ] **Step 7: Implement `updateItemQuantity` and `decrementItem` in cart store**

In `src/store/useCartStore.ts`, update the interface and implementation:

```typescript
interface CartState {
  items: CartItem[];
  addItem: (item: CartItemInput) => void;
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  decrementItem: (cartItemId: string) => void;
  clearCart: () => void;
}

// ... inside the create((set) => ({ ... })):
updateItemQuantity: (cartItemId, quantity) => set((state) => {
  if (quantity <= 0) {
    return { items: state.items.filter(item => item.cartItemId !== cartItemId) };
  }
  return {
    items: state.items.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity } : item
    )
  };
}),
decrementItem: (cartItemId) => set((state) => {
  const item = state.items.find(item => item.cartItemId === cartItemId);
  if (!item) return state;
  if (item.quantity <= 1) {
    return { items: state.items.filter(i => i.cartItemId !== cartItemId) };
  }
  return {
    items: state.items.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
    )
  };
}),
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- src/store/useCartStore.test.ts`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/store/useCartStore.ts src/store/useCartStore.test.ts
git commit -m "feat(cart): add getItemById selector, updateItemQuantity and decrementItem actions"
```

---

## Task 2: Update MenuItem component with +/- quantity controls

**Files:**
- Modify: `src/components/menu/MenuItem.tsx`

- [ ] **Step 1: Write failing tests for MenuItem quantity controls**

Add to `src/components/menu/MenuItem.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { useCartStore } from './useCartStore';
import { MenuItem } from './MenuItem';

describe('MenuItem Component - Quantity Controls', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('shows + button when item is not in cart', () => {
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDefined();
  });

  it('shows + button when item quantity is 1', () => {
    useCartStore.getState().addItem({ id: 'test-1', title: 'Test Item', price: 10.00, quantity: 1 });
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDefined();
  });

  it('shows - N + badge when item quantity is 2 or more', () => {
    useCartStore.getState().addItem({ id: 'test-1', title: 'Test Item', price: 10.00, quantity: 2 });
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeDefined();
  });

  it('clicking + adds item to cart', () => {
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('clicking - decreases quantity or removes item', () => {
    useCartStore.getState().addItem({ id: 'test-1', title: 'Test Item', price: 10.00, quantity: 2 });
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(useCartStore.getState().items.length).toBe(1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });

  it('clicking - at quantity 1 removes item', () => {
    useCartStore.getState().addItem({ id: 'test-1', title: 'Test Item', price: 10.00, quantity: 1 });
    render(<MenuItem id="test-1" title="Test Item" price={10.00} imgUrl="/placeholder.png" />);
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(useCartStore.getState().items.length).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/components/menu/MenuItem.test.tsx`
Expected: FAIL - tests for badge, decrease/increase buttons should fail (not implemented yet)

- [ ] **Step 3: Implement MenuItem with quantity controls**

Update `src/components/menu/MenuItem.tsx`:

```typescript
import React from 'react';
import { Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface MenuItemProps {
  id: string;
  title: string;
  price: number;
  description?: string;
  imgUrl: string;
  tableId?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({ id, title, price, description, imgUrl, tableId }) => {
  const addItem = useCartStore((state) => state.addItem);
  const decrementItem = useCartStore((state) => state.decrementItem);
  const cartItem = useCartStore((state) =>
    state.items.find(item => item.id === id && item.customizations === undefined)
  );
  const quantity = cartItem?.quantity ?? 0;
  const href = tableId ? `/table/${tableId}/menu/${id}` : `/menu/${id}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, title, price, quantity: 1 });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartItem) {
      decrementItem(cartItem.cartItemId);
    }
  };

  return (
    <Link href={href} className="flex justify-between gap-4 py-4 border-b hover:bg-muted/50 transition-colors">
      <div className="flex flex-col gap-1 justify-center">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}
        <span className="font-medium mt-1">${price.toFixed(2)}</span>
      </div>
      <div className="relative w-[104px] h-[104px] rounded-md overflow-hidden bg-muted flex-shrink-0">
        <img src={imgUrl} alt={title} className="object-cover w-full h-full" />
        {quantity < 2 ? (
          <button
            className="absolute bottom-[-12px] right-2 w-8 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%] hover:bg-muted transition-colors"
            onClick={handleAdd}
            aria-label="Add to cart"
          >
            <Plus size={14} />
          </button>
        ) : (
          <div className="absolute bottom-[-12px] right-2 h-8 rounded-full bg-background border shadow-sm flex items-center justify-center translate-y-[-50%] hover:bg-muted transition-all duration-150 gap-1 px-2 animate-in fade-in scale-in-100">
            <button
              className="w-6 h-6 flex items-center justify-center"
              onClick={handleDecrement}
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium w-4 text-center">{quantity}</span>
            <button
              className="w-6 h-6 flex items-center justify-center"
              onClick={handleAdd}
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/components/menu/MenuItem.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/menu/MenuItem.tsx src/components/menu/MenuItem.test.tsx
git commit -m "feat(menu): add +/- quantity controls to quick add button"
```

---

## Notes

- The badge uses Tailwind classes matching the design spec (rounded-full, shadow, etc.)
- Badge animation uses `animate-in fade-in scale-in-100` with `duration-150` for smooth appearance
- Quick add always uses `customizations: undefined`
- Items with same id but different customizations are treated as separate entries in cart
- Component subscribes to cart store to auto-update when quantities change
