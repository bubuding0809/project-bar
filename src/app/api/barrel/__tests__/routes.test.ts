import { expect, test, vi, describe, beforeEach } from 'vitest';

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    exists: vi.fn(),
    del: vi.fn(),
  }
}));

vi.mock('@/lib/pusher-server', () => ({
  serverPusher: { trigger: vi.fn().mockResolvedValue(undefined) }
}));

import { POST as createGame } from '../create/route';
import { POST as joinGame } from '../join/route';
import { POST as startRound } from '../start-round/route';
import { POST as insertSword } from '../insert-sword/route';
import { POST as leaveGame } from '../leave/route';
import { POST as closeGame } from '../close/route';
import { GET as getGame } from '../[tableId]/route';
import { redis } from '@/lib/redis';

const mockRedis = redis as ReturnType<typeof vi.fn>;

describe('Barrel API - Create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.exists.mockResolvedValue(0);
    mockRedis.set.mockResolvedValue('OK');
  });

  test('creates barrel game with host player', async () => {
    const req = new Request('http://localhost/api/barrel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        roundId: 'round1',
        hostProfile: { userId: 'host1', nickname: 'Host', emoji: '👑' }
      })
    });

    const res = await createGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.game.status).toBe('LOBBY');
    expect(data.game.host).toBe('host1');
    expect(data.game.players).toHaveLength(1);
    expect(data.game.players[0].userId).toBe('host1');
  });

  test('returns existing game if already exists', async () => {
    const existingGame = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Existing', emoji: '🎮' }]
    };
    mockRedis.get.mockResolvedValue(existingGame);

    const req = new Request('http://localhost/api/barrel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        roundId: 'round2',
        hostProfile: { userId: 'host2', nickname: 'New Host', emoji: '👑' }
      })
    });

    const res = await createGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.host).toBe('host1');
    expect(data.game.players[0].nickname).toBe('Existing');
  });

  test('rejects if tower game is running', async () => {
    mockRedis.exists.mockResolvedValue(1);

    const req = new Request('http://localhost/api/barrel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        roundId: 'round1',
        hostProfile: { userId: 'host1', nickname: 'Host', emoji: '👑' }
      })
    });

    const res = await createGame(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Tower game');
  });

  test('validates required fields', async () => {
    const req = new Request('http://localhost/api/barrel/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1' })
    });

    const res = await createGame(req);
    expect(res.status).toBe(400);
  });
});

describe('Barrel API - Join', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('adds player to lobby', async () => {
    const lobbyState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(lobbyState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        playerProfile: { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      })
    });

    const res = await joinGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.players).toHaveLength(2);
    expect(data.game.players[1].userId).toBe('player2');
  });

  test('does not duplicate if player already in game', async () => {
    const lobbyState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'player2', nickname: 'Player2', emoji: '🎮' }]
    };
    mockRedis.get.mockResolvedValue(lobbyState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        playerProfile: { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      })
    });

    const res = await joinGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.players).toHaveLength(1);
  });

  test('rejects if game not in LOBBY status', async () => {
    const gameState = {
      status: 'PLAYER_TURN',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(gameState);

    const req = new Request('http://localhost/api/barrel/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId: 'table1',
        playerProfile: { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      })
    });

    const res = await joinGame(req);
    expect(res.status).toBe(400);
  });
});

describe('Barrel API - Start Round', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('host can start round with 2+ players', async () => {
    const lobbyState = {
      status: 'LOBBY',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ]
    };
    mockRedis.get.mockResolvedValue(lobbyState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/start-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1' })
    });

    const res = await startRound(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.status).toBe('PLAYER_TURN');
    expect(data.game.triggerSlot).toBeDefined();
    expect(data.game.filledSlots).toEqual([]);
  });

  test('non-host cannot start round', async () => {
    const lobbyState = {
      status: 'LOBBY',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ]
    };
    mockRedis.get.mockResolvedValue(lobbyState);

    const req = new Request('http://localhost/api/barrel/start-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'player2' })
    });

    const res = await startRound(req);
    expect(res.status).toBe(403);
  });

  test('requires at least 2 players', async () => {
    const lobbyState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(lobbyState);

    const req = new Request('http://localhost/api/barrel/start-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1' })
    });

    const res = await startRound(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('2 players');
  });
});

describe('Barrel API - Insert Sword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('inserts sword and advances turn', async () => {
    const gameState = {
      status: 'PLAYER_TURN',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ],
      currentPlayerIndex: 0,
      triggerSlot: 15,
      filledSlots: []
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/insert-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1', slotIndex: 5 })
    });

    const res = await insertSword(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.filledSlots).toContain(5);
    expect(data.game.currentPlayerIndex).toBe(1);
  });

  test('triggers round end when hitting trigger slot', async () => {
    const gameState = {
      status: 'PLAYER_TURN',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ],
      currentPlayerIndex: 0,
      triggerSlot: 5,
      filledSlots: []
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/insert-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1', slotIndex: 5 })
    });

    const res = await insertSword(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game.status).toBe('ROUND_END');
    expect(data.game.loserId).toBe('host1');
    expect(data.game.forfeitCategory).toBeDefined();
    expect(data.game.forfeitText).toBeDefined();
  });

  test('rejects if not player turn', async () => {
    const gameState = {
      status: 'PLAYER_TURN',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ],
      currentPlayerIndex: 1,
      triggerSlot: 5,
      filledSlots: []
    };
    mockRedis.get.mockResolvedValue(gameState);

    const req = new Request('http://localhost/api/barrel/insert-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1', slotIndex: 3 })
    });

    const res = await insertSword(req);
    expect(res.status).toBe(403);
  });

  test('rejects filled slots', async () => {
    const gameState = {
      status: 'PLAYER_TURN',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }],
      currentPlayerIndex: 0,
      triggerSlot: 5,
      filledSlots: [3]
    };
    mockRedis.get.mockResolvedValue(gameState);

    const req = new Request('http://localhost/api/barrel/insert-sword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'host1', slotIndex: 3 })
    });

    const res = await insertSword(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('already filled');
  });
});

describe('Barrel API - Leave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('removes player from game', async () => {
    const gameState = {
      status: 'LOBBY',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ]
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'player2' })
    });

    const res = await leaveGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockRedis.set).toHaveBeenCalled();
  });

  test('does nothing if player not in game', async () => {
    const gameState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.set.mockResolvedValue('OK');

    const req = new Request('http://localhost/api/barrel/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1', userId: 'nonexistent' })
    });

    const res = await leaveGame(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});

describe('Barrel API - Close', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('only host can close game', async () => {
    const gameState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.del.mockResolvedValue(1);

    const req = new Request('http://localhost/api/barrel/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1' })
    });

    const res = await closeGame(req);
    expect(res.status).toBe(200);
    expect(mockRedis.del).toHaveBeenCalled();
  });

  test('non-host can also close game', async () => {
    const gameState = {
      status: 'LOBBY',
      host: 'host1',
      players: [
        { userId: 'host1', nickname: 'Host', emoji: '👑' },
        { userId: 'player2', nickname: 'Player2', emoji: '🎮' }
      ]
    };
    mockRedis.get.mockResolvedValue(gameState);
    mockRedis.del.mockResolvedValue(1);

    const req = new Request('http://localhost/api/barrel/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId: 'table1' })
    });

    const res = await closeGame(req);
    expect(res.status).toBe(200);
    expect(mockRedis.del).toHaveBeenCalled();
  });
});

describe('Barrel API - Get Game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns game if exists', async () => {
    const gameState = {
      status: 'LOBBY',
      host: 'host1',
      players: [{ userId: 'host1', nickname: 'Host', emoji: '👑' }]
    };
    mockRedis.get.mockResolvedValue(gameState);

    const req = new Request('http://localhost/api/barrel/table1');
    const res = await getGame(req, { params: Promise.resolve({ tableId: 'table1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game).toBeDefined();
    expect(data.game.status).toBe('LOBBY');
  });

  test('returns null if game not found', async () => {
    mockRedis.get.mockResolvedValue(null);

    const req = new Request('http://localhost/api/barrel/table1');
    const res = await getGame(req, { params: Promise.resolve({ tableId: 'table1' }) });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.game).toBeNull();
  });
});