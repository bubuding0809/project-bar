import { expect, test, vi } from 'vitest';
import { POST as timeoutRoute } from '../timeout/route';

vi.mock('@/lib/redis', () => ({
  redis: { del: vi.fn().mockResolvedValue(1) }
}));
vi.mock('@/lib/pusher-server', () => ({
  serverPusher: { trigger: vi.fn() }
}));

test('payment timeout dissolves lobby', async () => {
  const req = new Request('http://localhost', { method: 'POST', body: JSON.stringify({tableId:'1'})});
  const res = await timeoutRoute(req);
  expect(res.status).toBe(200);
});
