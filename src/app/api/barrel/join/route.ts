import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { BarrelState } from '@/types/barrel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, playerProfile } = body;

    if (!tableId || !playerProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:barrel`;
    const state = await redis.get<BarrelState>(key);

    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (state.status !== 'LOBBY') {
      return NextResponse.json({ error: 'Game has already started' }, { status: 400 });
    }

    const alreadyIn = state.players.some(p => p.userId === playerProfile.userId);
    if (!alreadyIn) {
      state.players.push(playerProfile);
    }

    await redis.set(key, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to join barrel game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
