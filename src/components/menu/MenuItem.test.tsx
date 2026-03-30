import { render, screen, fireEvent } from '@testing-library/react';
import { useCartStore } from '@/store/useCartStore';
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

});
