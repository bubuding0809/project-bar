import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { BarrelState } from '@/types/barrel';

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
      return NextResponse.json({ success: true }); // no-op
    }

    state.players = state.players.filter(p => p.userId !== userId);

    if (state.players.length === 0) {
      if (state.status === 'LOBBY') {
        await redis.del(key);
      } else {
        await redis.set(key, state, { ex: 3600 });
      }
    } else {
      if (state.host === userId && state.players.length > 0) {
        state.host = state.players[0].userId;
      }
      await redis.set(key, state, { ex: 3600 });
    }

    try {
      await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to leave barrel game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
