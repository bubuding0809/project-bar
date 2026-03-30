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

  it('should find item by id and undefined customizations', () => {
    useCartStore.getState().addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1 });
    useCartStore.getState().addItem({ id: '1', title: 'Test Item', price: 10.00, quantity: 1, customizations: { iceLevel: 'Normal' } });
    
    const result = useCartStore.getState().getItemById('1');
    
    expect(result).toBeDefined();
    expect(result?.id).toBe('1');
    expect(result?.customizations).toBeUndefined();
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
});
