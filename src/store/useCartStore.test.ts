import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore, selectTotalPrice } from './useCartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('should add an item to the cart and assign a cartItemId', () => {
    const store = useCartStore.getState();
    store.addItem({ id: '1', title: 'Aroi Cha Yen', price: 18.00, quantity: 1 });
    
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].cartItemId).toBeDefined();
    expect(typeof items[0].cartItemId).toBe('string');
    expect(selectTotalPrice(useCartStore.getState())).toBe(18.00);
  });

  it('should aggregate identical items (matching id and customizations)', () => {
    const store = useCartStore.getState();
    const itemInfo = { id: '1', title: 'Aroi Cha Yen', price: 18.00 };
    const customizations = { iceLevel: 'Normal', sugarLevel: 'Less' };
    
    store.addItem({ ...itemInfo, quantity: 1, customizations });
    store.addItem({ ...itemInfo, quantity: 2, customizations });
    
    const items = useCartStore.getState().items;
    expect(items.length).toBe(1);
    expect(items[0].quantity).toBe(3);
    expect(selectTotalPrice(useCartStore.getState())).toBe(54.00);
  });

  it('should not aggregate items with different customizations', () => {
    const store = useCartStore.getState();
    const itemInfo = { id: '1', title: 'Aroi Cha Yen', price: 18.00 };
    
    store.addItem({ ...itemInfo, quantity: 1, customizations: { iceLevel: 'Normal' } });
    store.addItem({ ...itemInfo, quantity: 1, customizations: { iceLevel: 'Less' } });
    
    const items = useCartStore.getState().items;
    expect(items.length).toBe(2);
    expect(items[0].quantity).toBe(1);
    expect(items[1].quantity).toBe(1);
    expect(selectTotalPrice(useCartStore.getState())).toBe(36.00);
  });
});
