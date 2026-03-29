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
