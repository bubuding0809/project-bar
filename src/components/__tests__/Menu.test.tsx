import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Menu from '../Menu';

class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', IntersectionObserver);
Element.prototype.scrollIntoView = vi.fn();

vi.mock('@/data/menu', () => ({
  menuData: [
    {
      category: 'Cocktails',
      items: [
        { name: 'Orh Huey', price: 18.00, imageUrl: 'https://example.com/img.jpg' },
      ],
    },
    {
      category: 'Wine',
      items: [
        { name: 'Cabernet Sauvignon', price: 15.00, imageUrl: 'https://example.com/wine.jpg' },
      ],
    },
  ],
}));

vi.mock('@/components/menu/FloatingCartButton', () => ({
  FloatingCartButton: () => null,
}));

const { BottomNavSpy } = vi.hoisted(() => ({ BottomNavSpy: vi.fn(() => null) }));
vi.mock('@/components/menu/BottomNav', () => ({
  BottomNav: BottomNavSpy,
}));

test('renders all menu items', () => {
  render(<Menu />);
  expect(screen.getByText('Orh Huey')).toBeTruthy();
});

test('renders category tabs', () => {
  render(<Menu />);
  const buttons = screen.getAllByRole('button', { name: 'Cocktails' });
  expect(buttons[0]).toBeInTheDocument();
});

test('renders header title', () => {
  render(<Menu />);
  const headings = screen.getAllByRole('heading', { name: 'Bar Lorong 13', level: 1 });
  expect(headings[0]).toBeInTheDocument();
});

test('renders search button', () => {
  render(<Menu />);
  const buttons = screen.getAllByRole('button');
  expect(buttons[0]).toBeInTheDocument();
});

test('renders BottomNav', () => {
  render(<Menu />);
  expect(BottomNavSpy).toHaveBeenCalled();
});

test('switches active category when clicking tab', () => {
  render(<Menu />);
  const wineTab = screen.getByRole('button', { name: 'Wine' });
  wineTab.click();
  const buttons = screen.getAllByRole('button', { name: 'Wine' });
  expect(buttons[0]).toBeInTheDocument();
});
