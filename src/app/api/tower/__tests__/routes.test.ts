import { expect, test, vi, beforeEach } from 'vitest';
import { TowerState } from '@/types/tower';

// Shared mocks
const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockExists = vi.fn();
const mockTrigger = vi.fn();

vi.mock('@/lib/redis', () => ({
  redis: {
    get: mockGet,
    set: mockSet,
    del: mockDel,
    exists: mockExists,
  },
}));
vi.mock('@/lib/pusher-server', () => ({
  serverPusher: { trigger: mockTrigger },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockTrigger.mockResolvedValue(undefined);
  mockSet.mockResolvedValue('OK');
  mockDel.mockResolvedValue(1);
});

// ─── create ────────────────────────────────────────────────────────────────

test('create: success', async () => {
  const { POST } = await import('../create/route');
  mockExists.mockResolvedValue(0);
  const req = new Request('http://localhost/api/tower/create', {
    method: 'POST',
    body: JSON.stringify({
      tableId: 't1',
      roundId: 'r1',
      hostProfile: { userId: 'u1', nickname: 'Host', emoji: '👑' },
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.status).toBe('LOBBY');
  expect(data.game.players).toHaveLength(1);
});

test('create: 400 if tower game exists', async () => {
  const { POST } = await import('../create/route');
  mockExists.mockResolvedValueOnce(1); // tower key exists
  const req = new Request('http://localhost/api/tower/create', {
    method: 'POST',
    body: JSON.stringify({
      tableId: 't1',
      roundId: 'r1',
      hostProfile: { userId: 'u1', nickname: 'Host', emoji: '👑' },
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test('create: 400 if roulette running', async () => {
  const { POST } = await import('../create/route');
  mockExists
    .mockResolvedValueOnce(0) // tower key absent
    .mockResolvedValueOnce(1); // roulette key present
  const req = new Request('http://localhost/api/tower/create', {
    method: 'POST',
    body: JSON.stringify({
      tableId: 't1',
      roundId: 'r1',
      hostProfile: { userId: 'u1', nickname: 'Host', emoji: '👑' },
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test('create: stores hostDare when provided', async () => {
  const { POST } = await import('../create/route');
  mockExists.mockResolvedValue(0);
  const req = new Request('http://localhost/api/tower/create', {
    method: 'POST',
    body: JSON.stringify({
      tableId: 't1',
      roundId: 'r1',
      hostProfile: { userId: 'u1', nickname: 'Host', emoji: '👑' },
      hostDare: 'Do a backflip',
    }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.hostDare).toBe('Do a backflip');
});

// ─── join ──────────────────────────────────────────────────────────────────

test('join: success', async () => {
  const { POST } = await import('../join/route');
  const lobbyState: TowerState = {
    status: 'LOBBY',
    host: 'u1',
    players: [{ userId: 'u1', nickname: 'Host', emoji: '👑' }],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockGet.mockResolvedValue(lobbyState);
  const req = new Request('http://localhost/api/tower/join', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', playerProfile: { userId: 'u2', nickname: 'Guest', emoji: '😎' } }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.players).toHaveLength(2);
});

test('join: 400 if not LOBBY', async () => {
  const { POST } = await import('../join/route');
  mockGet.mockResolvedValue({ status: 'PLAYER_TURN', players: [] });
  const req = new Request('http://localhost/api/tower/join', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', playerProfile: { userId: 'u2', nickname: 'G', emoji: '😎' } }),
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

test('join: deduplication — same player not added twice', async () => {
  const { POST } = await import('../join/route');
  const lobbyState: TowerState = {
    status: 'LOBBY',
    host: 'u1',
    players: [
      { userId: 'u1', nickname: 'Host', emoji: '👑' },
      { userId: 'u2', nickname: 'Guest', emoji: '😎' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockGet.mockResolvedValue(lobbyState);
  const req = new Request('http://localhost/api/tower/join', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', playerProfile: { userId: 'u2', nickname: 'Guest', emoji: '😎' } }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.players).toHaveLength(2);
});

// ─── start ─────────────────────────────────────────────────────────────────

test('start: success', async () => {
  const { POST } = await import('../start/route');
  const state: TowerState = {
    status: 'LOBBY',
    host: 'u1',
    players: [
      { userId: 'u1', nickname: 'A', emoji: '👑' },
      { userId: 'u2', nickname: 'B', emoji: '😎' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  };
  mockGet.mockResolvedValue(state);
  const req = new Request('http://localhost/api/tower/start', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u1' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.status).toBe('PLAYER_TURN');
});

test('start: 403 non-host', async () => {
  const { POST } = await import('../start/route');
  mockGet.mockResolvedValue({
    status: 'LOBBY',
    host: 'u1',
    players: [
      { userId: 'u1', nickname: 'A', emoji: '👑' },
      { userId: 'u2', nickname: 'B', emoji: '😎' },
    ],
  });
  const req = new Request('http://localhost/api/tower/start', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(403);
});

test('start: 400 with < 2 players', async () => {
  const { POST } = await import('../start/route');
  mockGet.mockResolvedValue({
    status: 'LOBBY',
    host: 'u1',
    players: [{ userId: 'u1', nickname: 'A', emoji: '👑' }],
  });
  const req = new Request('http://localhost/api/tower/start', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u1' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(400);
});

// ─── submit-turn ───────────────────────────────────────────────────────────

const twoPlayerState = (): TowerState => ({
  status: 'PLAYER_TURN',
  host: 'u1',
  players: [
    { userId: 'u1', nickname: 'A', emoji: '👑' },
    { userId: 'u2', nickname: 'B', emoji: '😎' },
  ],
  roundId: 'r1',
  currentPlayerIndex: 0,
  results: [],
});

test('submit-turn: advances to next player (not last)', async () => {
  const { POST } = await import('../submit-turn/route');
  mockGet.mockResolvedValue(twoPlayerState());
  const req = new Request('http://localhost/api/tower/submit-turn', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u1', fill: 0.6 }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const savedState = mockSet.mock.calls[0][1] as TowerState;
  expect(savedState.currentPlayerIndex).toBe(1);
  expect(savedState.results).toHaveLength(1);
  expect(savedState.results[0].busted).toBe(false);
});

test('submit-turn: busted flag set when fill >= 1.0', async () => {
  const { POST } = await import('../submit-turn/route');
  mockGet.mockResolvedValue(twoPlayerState());
  const req = new Request('http://localhost/api/tower/submit-turn', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u1', fill: 1.2 }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const savedState = mockSet.mock.calls[0][1] as TowerState;
  expect(savedState.results[0].busted).toBe(true);
  expect(savedState.results[0].fill).toBe(1.0); // clamped
});

test('submit-turn: 403 wrong player', async () => {
  const { POST } = await import('../submit-turn/route');
  mockGet.mockResolvedValue(twoPlayerState()); // currentPlayerIndex=0 → u1's turn
  const req = new Request('http://localhost/api/tower/submit-turn', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2', fill: 0.5 }),
  });
  const res = await POST(req);
  expect(res.status).toBe(403);
});

test('submit-turn: ROUND_END when last player, winnerId computed', async () => {
  const { POST } = await import('../submit-turn/route');
  const state = twoPlayerState();
  // u1 already went with fill=0.5
  state.results = [{ userId: 'u1', fill: 0.5, busted: false }];
  state.currentPlayerIndex = 1;
  mockGet.mockResolvedValue(state);

  const req = new Request('http://localhost/api/tower/submit-turn', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2', fill: 0.7 }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const savedState = mockSet.mock.calls[0][1] as TowerState;
  expect(savedState.status).toBe('ROUND_END');
  // u2 has higher fill (0.7 > 0.5) without busting
  expect(savedState.winnerId).toBe('u2');
  expect(savedState.forfeitText).toBeDefined();
  expect(savedState.forfeitCategory).toBeDefined();
});

test('submit-turn: all-bust scenario picks max-fill winner', async () => {
  const { POST } = await import('../submit-turn/route');
  const state = twoPlayerState();
  state.results = [{ userId: 'u1', fill: 1.0, busted: true }];
  state.currentPlayerIndex = 1;
  mockGet.mockResolvedValue(state);

  const req = new Request('http://localhost/api/tower/submit-turn', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2', fill: 1.05 }), // also busted
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const savedState = mockSet.mock.calls[0][1] as TowerState;
  expect(savedState.status).toBe('ROUND_END');
  // Both busted: u2 submitted 1.05 → clamped to 1.0, u1 also 1.0 — tie → first in reduce wins
  // (both clamped to 1.0, so reduce picks whichever comes first with >, u1 wins)
  expect(['u1', 'u2']).toContain(savedState.winnerId);
});

// ─── forfeit ───────────────────────────────────────────────────────────────

test('forfeit: success', async () => {
  const { POST } = await import('../forfeit/route');
  const state: TowerState = {
    status: 'ROUND_END',
    host: 'u1',
    players: [
      { userId: 'u1', nickname: 'A', emoji: '👑' },
      { userId: 'u2', nickname: 'B', emoji: '😎' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 1,
    results: [],
    winnerId: 'u1',
    forfeitText: 'Do a backflip',
    forfeitCategory: 'dare',
  };
  mockGet.mockResolvedValue(state);
  const req = new Request('http://localhost/api/tower/forfeit', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', winnerId: 'u1', targetUserId: 'u2' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data.game.status).toBe('FORFEIT');
  expect(data.game.forfeit.toUserId).toBe('u2');
  expect(data.game.forfeit.category).toBe('dare');
});

test('forfeit: 403 non-winner', async () => {
  const { POST } = await import('../forfeit/route');
  mockGet.mockResolvedValue({
    status: 'ROUND_END',
    winnerId: 'u1',
    forfeitText: 'test',
    forfeitCategory: 'drink',
  });
  const req = new Request('http://localhost/api/tower/forfeit', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', winnerId: 'u2', targetUserId: 'u1' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(403);
});
