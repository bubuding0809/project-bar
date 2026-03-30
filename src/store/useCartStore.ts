import { create } from 'zustand';

export interface CartItem {
  cartItemId: string;
  id: string;
  title: string;
  price: number;
  quantity: number;
  customizations?: { iceLevel?: string; sugarLevel?: string };
}

export type CartItemInput = Omit<CartItem, 'cartItemId'>;

interface CartState {
  items: CartItem[];
  addItem: (item: CartItemInput) => void;
  clearCart: () => void;
}

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

const areCustomizationsEqual = (c1?: CartItem['customizations'], c2?: CartItem['customizations']) => {
  if (!c1 && !c2) return true;
  if (!c1 || !c2) return false;
  return c1.iceLevel === c2.iceLevel && c1.sugarLevel === c2.sugarLevel;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  clearCart: () => set({ items: [] }),
  addItem: (newItemInput) => set((state) => {
    const existingItemIndex = state.items.findIndex(
      (item) => item.id === newItemInput.id && areCustomizationsEqual(item.customizations, newItemInput.customizations)
    );

    if (existingItemIndex >= 0) {
      const updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + newItemInput.quantity
      };
      return { items: updatedItems };
    }

    const newItem: CartItem = {
      ...newItemInput,
      cartItemId: crypto.randomUUID()
    };
    return { items: [...state.items, newItem] };
  }),
}));
