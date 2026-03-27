import { NextResponse } from 'next/server';
import { serverPusher } from '@/lib/pusher-server';
import { redis } from '@/lib/redis';
import { GameState } from '@/types/game';

export async function POST(req: Request) {
  const { tableId, userId } = await req.json();
  const gameKey = `table:${tableId}:game`;
  const game = await redis.get(gameKey) as GameState | null;
  if (game && game.players) {
    game.players = game.players.filter(p => p.userId !== userId);
    await redis.set(gameKey, game, { ex: 3600 });
    await serverPusher.trigger(`table-${tableId}`, 'game-updated', game);
  }
  return NextResponse.json({ success: true });
}
