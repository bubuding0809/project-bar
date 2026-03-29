import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { TowerState } from '@/types/tower';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, roundId, hostProfile, hostDare } = body;

    if (!tableId || !roundId || !hostProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const towerKey = `table:${tableId}:tower`;
    const gameKey = `table:${tableId}:game`;

    if (await redis.exists(towerKey)) {
      return NextResponse.json({ error: 'Tower game already exists' }, { status: 400 });
    }
    if (await redis.exists(gameKey)) {
      return NextResponse.json({ error: 'Roulette game already running' }, { status: 400 });
    }

    const state: TowerState = {
      status: 'LOBBY',
      host: hostProfile.userId,
      players: [hostProfile],
      roundId,
      currentPlayerIndex: 0,
      results: [],
      ...(hostDare?.trim() ? { hostDare: hostDare.trim() } : {}),
    };

    await redis.set(towerKey, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'tower-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to create tower game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
