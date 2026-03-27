import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { GameState } from '@/types/game';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, userId } = body;

    if (!tableId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    
    // Fetch the current game state from Redis
    const gameState = await redis.get<GameState>(gameKey);

    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (gameState.host !== userId) {
      return NextResponse.json({ error: 'Only the host can spin the wheel' }, { status: 403 });
    }

    if (gameState.status !== 'GATHERING') {
      return NextResponse.json({ error: 'Game is not in GATHERING state' }, { status: 400 });
    }

    if (gameState.players.length < 2) {
      return NextResponse.json({ error: 'Not enough players' }, { status: 400 });
    }

    // Select random loser
    const randomIndex = Math.floor(Math.random() * gameState.players.length);
    const loser = gameState.players[randomIndex];

    // Update state
    gameState.status = 'SPINNING';
    gameState.loserId = loser.userId;

    // Save to Redis
    await redis.set(gameKey, gameState, { ex: 3600 });

    try {
      const targetEndTime = Date.now() + 10000;
      // Trigger spin_start event via Pusher with { loserId, targetEndTime }
      await serverPusher.trigger(`table-${tableId}`, 'spin_start', { loserId: loser.userId, targetEndTime });
      // We should also trigger game-updated so state is fully synchronized
      await serverPusher.trigger(`table-${tableId}`, 'game-updated', gameState);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: gameState });
  } catch (error) {
    console.error('Failed to spin wheel:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
