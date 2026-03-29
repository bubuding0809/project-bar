import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../route';
import { serverPusher } from '@/lib/pusher-server';

vi.mock('@/lib/pusher-server', () => ({
  serverPusher: {
    authorizeChannel: vi.fn(),
  },
}));

describe('POST /api/pusher/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 if socket_id or channel_name is missing', async () => {
    const req = new Request('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: new URLSearchParams({ socket_id: '123' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('authorizes private channel', async () => {
    const mockAuthResponse = { auth: 'mock_auth_token' };
    vi.mocked(serverPusher.authorizeChannel).mockReturnValue(mockAuthResponse);

    const req = new Request('http://localhost/api/pusher/auth', {
      method: 'POST',
      body: new URLSearchParams({
        socket_id: '123.456',
        channel_name: 'private-table-abc',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(mockAuthResponse);
    expect(serverPusher.authorizeChannel).toHaveBeenCalledWith('123.456', 'private-table-abc');
  });
});
