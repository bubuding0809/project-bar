import { expect, test, vi } from 'vitest';
import { POST as joinGame } from '../join/route';

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue({ status: 'SPINNING' }),
    exists: vi.fn().mockResolvedValue(1)
  }
}));
vi.mock('@/lib/pusher-server', () => ({
  serverPusher: { trigger: vi.fn() }
}));

test('join rejects late joiners', async () => {
  const req = new Request('http://localhost/api/game/join', {
    method: 'POST',
    body: JSON.stringify({ tableId: '1', playerProfile: { userId: '1', nickname: 'A', emoji: '1' }})
  });
  const res = await joinGame(req);
  expect(res.status).toBe(400);
});
