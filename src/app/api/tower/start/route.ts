import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { TowerState } from '@/types/tower';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, userId } = body;

    if (!tableId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:tower`;
    const state = await redis.get<TowerState>(key);

    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (state.host !== userId) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }
    if (state.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Game is not in LOBBY state' }, { status: 400 });
    }
    if (state.players.length < 2) {
      return NextResponse.json({ error: 'Need at least 2 players to start' }, { status: 400 });
    }

    state.status = 'PLAYER_TURN';
    state.currentPlayerIndex = 0;

    await redis.set(key, state, { ex: 3600 });

    const firstPlayer = state.players[0];
    try {
      await serverPusher.trigger(`table-${tableId}`, 'tower-updated', state);
      await serverPusher.trigger(`table-${tableId}`, 'tower-turn-start', {
        playerId: firstPlayer.userId,
        playerIndex: 0,
      });
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to start tower game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
