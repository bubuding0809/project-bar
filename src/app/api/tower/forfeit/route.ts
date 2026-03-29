import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { TowerState, TowerForfeit } from '@/types/tower';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, winnerId, targetUserId } = body;

    if (!tableId || !winnerId || !targetUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:tower`;
    const state = await redis.get<TowerState>(key);

    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (state.status !== 'ROUND_END') {
      return NextResponse.json({ error: 'Not in ROUND_END state' }, { status: 400 });
    }
    if (state.winnerId !== winnerId) {
      return NextResponse.json({ error: 'Only the winner can assign the forfeit' }, { status: 403 });
    }

    const forfeit: TowerForfeit = {
      fromUserId: winnerId,
      toUserId: targetUserId,
      text: state.forfeitText!,
      category: state.forfeitCategory!,
    };

    state.status = 'FORFEIT';
    state.forfeit = forfeit;

    await redis.set(key, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'tower-forfeit', { forfeit });
      await serverPusher.trigger(`table-${tableId}`, 'tower-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to assign forfeit:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
