import { expect, test, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { Suspense } from 'react';
import Page from '../page';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams('view=games')),
  useParams: vi.fn(() => ({ tableId: '1' })),
  usePathname: vi.fn(() => '/table/1'),
}));

class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
vi.stubGlobal('IntersectionObserver', IntersectionObserver);
Element.prototype.scrollIntoView = vi.fn();

// Mock overlays to prevent Pusher/fetch errors
vi.mock('@/components/GameOverlay', () => ({
  default: () => <div data-testid="game-overlay-mock" />
}));
vi.mock('@/components/TowerOverlay', () => ({
  default: () => <div data-testid="tower-overlay-mock" />
}));
vi.mock('@/components/menu/FloatingCartButton', () => ({
  FloatingCartButton: () => <div data-testid="floating-cart-mock" />
}));

test('opens bottom sheet and shows stepper', async () => {
  const params = Promise.resolve({ tableId: '1' });
  
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <Page params={params} />
      </Suspense>
    );
  });

  const button = await screen.findByText('Play Roulette');
  fireEvent.click(button);
  
  expect(screen.getByText('Set the Stakes')).toBeTruthy();
  fireEvent.click(screen.getByText('+'));
  expect(screen.getByText('2')).toBeTruthy();
});
