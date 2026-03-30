import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { BarrelState } from '@/types/barrel';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, roundId, hostProfile } = body;

    if (!tableId || !roundId || !hostProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const barrelKey = `table:${tableId}:barrel`;
    const towerKey = `table:${tableId}:tower`;
    const gameKey = `table:${tableId}:game`;

    // If barrel game already exists, just return it (allow rejoining)
    const existing = await redis.get<BarrelState>(barrelKey);
    if (existing) {
      return NextResponse.json({ success: true, game: existing });
    }

    // Check no other game is running
    if (await redis.exists(towerKey)) {
      return NextResponse.json({ error: 'Tower game already running' }, { status: 400 });
    }
    if (await redis.exists(gameKey)) {
      return NextResponse.json({ error: 'Roulette game already running' }, { status: 400 });
    }

    const state: BarrelState = {
      status: 'LOBBY',
      host: hostProfile.userId,
      players: [hostProfile],
      roundId,
      currentPlayerIndex: 0,
      triggerSlot: 0,
      filledSlots: [],
    };

    await redis.set(barrelKey, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to create barrel game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
