import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { BarrelState } from '@/types/barrel';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, userId } = body;

    if (!tableId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:barrel`;
    const state = await redis.get<BarrelState>(key);

    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (state.host !== userId) {
      return NextResponse.json({ error: 'Only the host can start the round' }, { status: 403 });
    }
    if (state.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Game is not in LOBBY state' }, { status: 400 });
    }
    if (state.players.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 });
    }

    state.triggerSlot = Math.floor(Math.random() * 24);
    state.status = 'PLAYER_TURN';
    state.filledSlots = [];
    state.currentPlayerIndex = 0;
    state.players = shuffleArray(state.players);

    await redis.set(key, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to start barrel round:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
