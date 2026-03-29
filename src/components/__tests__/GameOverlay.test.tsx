import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GameOverlay from '../GameOverlay';

vi.mock('@/lib/pusher-client', () => ({
  getClientPusher: vi.fn(() => ({
    subscribe: vi.fn(() => ({
      bind: vi.fn(),
      unbind_all: vi.fn(),
      unsubscribe: vi.fn()
    }))
  }))
}));

test('disables spin when < 2 players', async () => {
  localStorage.setItem('demo_user_id', 'user_1');
  
  // Mock fetch to return a game with 1 player
  global.fetch = vi.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ game: { status: 'GATHERING', host: 'user_1', players: [{userId: 'user_1'}], drinkType: 'Tequila Shots', drinkQuantity: 4 } })
  })) as unknown as typeof fetch;

  render(<GameOverlay tableId="1" />);
  // Wait for fetch
  await screen.findByText(/Playing for/);
  expect(screen.getByText('Waiting for more players...')).toBeTruthy();
  expect(screen.getByRole('button', {name: /Waiting/})).toHaveProperty('disabled', true);
});
