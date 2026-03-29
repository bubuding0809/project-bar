import { expect, test, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import TowerOverlay from '../TowerOverlay';
import { TowerState } from '@/types/tower';

vi.mock('@/lib/pusher-client', () => ({
  getClientPusher: vi.fn(() => ({
    subscribe: vi.fn(() => ({
      bind: vi.fn(),
      unbind_all: vi.fn(),
      unsubscribe: vi.fn(),
    })),
  })),
}));

let container: HTMLDivElement;

beforeEach(() => {
  localStorage.setItem('demo_user_id', 'user_1');
  vi.clearAllMocks();
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
});

const mockFetch = (response: object | null, ok = true) => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok,
      json: () => Promise.resolve(response),
    })
  ) as unknown as typeof fetch;
};

test('renders null when no active tower game (404 response)', async () => {
  mockFetch({ error: 'Not found' }, false);
  const { container: c } = render(<TowerOverlay tableId="t1" />, { container });
  await new Promise(r => setTimeout(r, 50));
  // Overlay div should not be present
  expect(c.querySelector('.fixed')).toBeNull();
});

test('renders lobby when status LOBBY', async () => {
  const state: TowerState = {
    status: 'LOBBY',
    host: 'user_1',
    players: [{ userId: 'user_1', nickname: 'Host', emoji: '👑' }],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockFetch({ game: state });
  const { container: c } = render(<TowerOverlay tableId="t1" />, { container });
  await screen.findByText('Tower Game');
  expect(within(c).getByText('Tower Game')).toBeTruthy();
});

test('Start Game button disabled with < 2 players', async () => {
  const state: TowerState = {
    status: 'LOBBY',
    host: 'user_1',
    players: [{ userId: 'user_1', nickname: 'Host', emoji: '👑' }],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockFetch({ game: state });
  const { container: c } = render(<TowerOverlay tableId="t1" />, { container });
  await screen.findByText('Tower Game');
  const btns = within(c).getAllByRole('button');
  const startBtn = btns.find(b => /Waiting for more players/.test(b.textContent ?? ''));
  expect(startBtn).toBeDefined();
  expect(startBtn).toHaveProperty('disabled', true);
});

test('shows hold screen for current player', async () => {
  const state: TowerState = {
    status: 'PLAYER_TURN',
    host: 'user_1',
    players: [
      { userId: 'user_1', nickname: 'Host', emoji: '👑' },
      { userId: 'user_2', nickname: 'Guest', emoji: '😎' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockFetch({ game: state });
  const { container: c } = render(<TowerOverlay tableId="t1" />, { container });
  // activePlayerId is set from tower-turn-start event; on hydrate we set it from currentPlayerIndex
  await screen.findByText(/Get ready/);
  expect(within(c).getByText(/Get ready/)).toBeTruthy();
});

test('shows watch screen when not current player', async () => {
  const state: TowerState = {
    status: 'PLAYER_TURN',
    host: 'user_1',
    players: [
      { userId: 'user_2', nickname: 'OtherPerson', emoji: '😎' },
      { userId: 'user_1', nickname: 'Host', emoji: '👑' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 0, // user_2's turn
    results: [],
  };
  mockFetch({ game: state });
  const { container: c } = render(<TowerOverlay tableId="t1" />, { container });
  await screen.findByText(/Waiting for/);
  expect(within(c).getByText(/OtherPerson/)).toBeTruthy();
});

test('calls onGameActiveChange(true) when game state arrives', async () => {
  const onChange = vi.fn();
  const state: TowerState = {
    status: 'LOBBY',
    host: 'user_1',
    players: [{ userId: 'user_1', nickname: 'Host', emoji: '👑' }],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockFetch({ game: state });
  render(<TowerOverlay tableId="t1" onGameActiveChange={onChange} />, { container });
  await screen.findByText('Tower Game');
  expect(onChange).toHaveBeenCalledWith(true);
});

test('calls onGameActiveChange(false) when no game', async () => {
  const onChange = vi.fn();
  mockFetch({ error: 'Not found' }, false);
  render(<TowerOverlay tableId="t1" onGameActiveChange={onChange} />, { container });
  await new Promise(r => setTimeout(r, 50));
  expect(onChange).toHaveBeenCalledWith(false);
});
