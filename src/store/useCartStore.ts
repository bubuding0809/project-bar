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
