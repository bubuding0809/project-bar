import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const tableId = (await params).tableId;

    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }

    const gameKey = `table:${tableId}:game`;
    const gameState = await redis.get(gameKey);

    if (!gameState) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, game: gameState });
  } catch (error) {
    console.error('Failed to fetch game state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
