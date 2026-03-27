import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { GameState } from '@/types/game';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, roundId, hostProfile, drinkType, drinkQuantity } = body;

    if (!tableId || !roundId || !hostProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    if (await redis.exists(gameKey)) {
      return NextResponse.json({ error: 'Game already exists' }, { status: 400 });
    }
    const gameState: GameState = {
      status: 'GATHERING',
      host: hostProfile.userId,
      players: [hostProfile],
      roundId,
      drinkType,
      drinkQuantity
    };

    // Store in Redis with an expiry of 1 hour (3600 seconds)
    await redis.set(gameKey, gameState, { ex: 3600 });

    try {
      // Broadcast the new game state via Pusher
      await serverPusher.trigger(`table-${tableId}`, 'game-updated', gameState);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: gameState });
  } catch (error) {
    console.error('Failed to create game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
