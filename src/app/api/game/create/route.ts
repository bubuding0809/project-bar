import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher';
import { GameState } from '@/types/game';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, roundId, hostProfile } = body;

    if (!tableId || !roundId || !hostProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    const gameState: GameState = {
      status: 'GATHERING',
      host: hostProfile.userId,
      players: [hostProfile],
      roundId,
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
