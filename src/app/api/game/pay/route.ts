import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { GameState } from '@/types/game';

export async function POST(request: Request) {
  try {
    const { tableId } = await request.json();

    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    const gameState = await redis.get<GameState>(gameKey);

    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (gameState.status === 'PAID') {
      return NextResponse.json({ error: 'Game already paid' }, { status: 400 });
    }

    // Update state to PAID
    gameState.status = 'PAID';

    // Save to Redis
    await redis.set(gameKey, gameState, { ex: 3600 });

    try {
      // Trigger game-paid event
      await serverPusher.trigger(`table-${tableId}`, 'game-paid', { tableId });
      // Trigger game-updated event so state is fully synchronized
      await serverPusher.trigger(`table-${tableId}`, 'game-updated', gameState);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: gameState });
  } catch (error) {
    console.error('Failed to process payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
