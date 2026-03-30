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
  updateItemQuantity: (cartItemId: string, quantity: number) => void;
  decrementItem: (cartItemId: string) => void;
  removeItem: (cartItemId: string) => void;
  getItemById: (menuItemId: string) => CartItem | undefined;
  clearCart: () => void;
}

export const selectTotalPrice = (state: CartState) =>
  state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

const areCustomizationsEqual = (c1?: CartItem['customizations'], c2?: CartItem['customizations']) => {
  if (!c1 && !c2) return true;
  if (!c1 || !c2) return false;
  return c1.iceLevel === c2.iceLevel && c1.sugarLevel === c2.sugarLevel;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  getItemById: (menuItemId) => get().items.find(item => item.id === menuItemId && item.customizations === undefined),
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
  removeItem: (cartItemId) => set((state) => ({
    items: state.items.filter(item => item.cartItemId !== cartItemId)
  })),
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
