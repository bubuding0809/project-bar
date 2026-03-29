import { expect, test, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockSet = vi.fn();
const mockDel = vi.fn();
const mockTrigger = vi.fn();

vi.mock('@/lib/redis', () => ({
  redis: {
    get: mockGet,
    set: mockSet,
    del: mockDel,
    exists: vi.fn().mockResolvedValue(0),
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

test('close: deletes Redis key and fires tower-lobby-closed', async () => {
  const { POST } = await import('../close/route');
  const req = new Request('http://localhost/api/tower/close', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  expect(mockDel).toHaveBeenCalledWith('table:t1:tower');
  expect(mockTrigger).toHaveBeenCalledWith('table-t1', 'tower-lobby-closed', {});
});

test('leave: removes player from LOBBY state', async () => {
  const { POST } = await import('../leave/route');
  mockGet.mockResolvedValue({
    status: 'LOBBY',
    host: 'u1',
    players: [
      { userId: 'u1', nickname: 'Host', emoji: '👑' },
      { userId: 'u2', nickname: 'Guest', emoji: '😎' },
    ],
    roundId: 'r1',
    currentPlayerIndex: 0,
    results: [],
  });
  const req = new Request('http://localhost/api/tower/leave', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const savedState = mockSet.mock.calls[0][1];
  expect(savedState.players).toHaveLength(1);
  expect(savedState.players[0].userId).toBe('u1');
});

test('leave: no-op if game not in LOBBY', async () => {
  const { POST } = await import('../leave/route');
  mockGet.mockResolvedValue({ status: 'PLAYER_TURN' });
  const req = new Request('http://localhost/api/tower/leave', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  expect(mockSet).not.toHaveBeenCalled();
});

test('leave: no-op if game not found', async () => {
  const { POST } = await import('../leave/route');
  mockGet.mockResolvedValue(null);
  const req = new Request('http://localhost/api/tower/leave', {
    method: 'POST',
    body: JSON.stringify({ tableId: 't1', userId: 'u2' }),
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
  expect(mockSet).not.toHaveBeenCalled();
});
