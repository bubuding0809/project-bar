import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { GameState, PlayerProfile } from '@/types/game';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, playerProfile } = body;

    if (!tableId || !playerProfile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    
    // Fetch the current game state from Redis
    const gameState = await redis.get<GameState>(gameKey);

    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (gameState.status !== 'GATHERING') {
      return NextResponse.json({ error: 'Game is no longer gathering players' }, { status: 400 });
    }

    // Check if player is already in the game
    const isPlayerInGame = gameState.players.some(
      (player) => player.userId === playerProfile.userId
    );

    if (!isPlayerInGame) {
      gameState.players.push(playerProfile);
      
      // Update the game state in Redis (maintain the remaining TTL or reset to 1 hour; 
      // let's just use keepTtl if supported or reset to 3600, reset is fine per reqs)
      await redis.set(gameKey, gameState, { ex: 3600 });
    }

    return NextResponse.json({ success: true, game: gameState });
  } catch (error) {
    console.error('Failed to join game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
