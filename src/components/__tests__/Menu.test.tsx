import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Menu from '../Menu';

vi.mock('@/data/menu', () => ({
  menuData: [
    {
      category: 'Cocktails',
      items: [
        { name: 'Orh Huey', price: 18.00, imageUrl: 'https://example.com/img.jpg' },
      ],
    },
  ],
}));

vi.mock('@/components/menu/FloatingCartButton', () => ({
  FloatingCartButton: () => null,
}));

test('renders all menu items', () => {
  render(<Menu />);
  expect(screen.getByText('Orh Huey')).toBeTruthy();
});

test('renders category tabs', () => {
  render(<Menu />);
  expect(screen.getAllByText('Cocktails').length).toBeGreaterThan(0);
});
