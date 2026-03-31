import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { TowerState, TowerTurnResult } from '@/types/tower';
import { pickRandomForfeit } from '@/data/forfeits';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, userId, fill } = body;

    if (!tableId || !userId || typeof fill !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:tower`;
    const state = await redis.get<TowerState>(key);

    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    if (state.status !== 'PLAYER_TURN') {
      return NextResponse.json({ error: 'Not in PLAYER_TURN state' }, { status: 400 });
    }

    const currentPlayer = state.players[state.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.userId !== userId) {
      return NextResponse.json({ error: 'Not your turn' }, { status: 403 });
    }

    const busted = fill >= 1.0;
    const result: TowerTurnResult = {
      userId,
      fill: Math.min(fill, 1.0),
      busted,
    };
    state.results.push(result);

    const isLastPlayer = state.results.length === state.players.length;

    if (!isLastPlayer) {
      state.currentPlayerIndex += 1;
      const nextPlayer = state.players[state.currentPlayerIndex];

      await redis.set(key, state, { ex: 3600 });

      try {
        await serverPusher.trigger(`table-${tableId}`, 'tower-turn-result', { result });
        
        // Pause to let everyone see the final result before next turn
        await new Promise(resolve => setTimeout(resolve, 1500));

        await serverPusher.trigger(`table-${tableId}`, 'tower-turn-start', {
          playerId: nextPlayer.userId,
          playerIndex: state.currentPlayerIndex,
        });
      } catch (pusherError) {
        console.error('Failed to trigger Pusher event:', pusherError);
      }

      return NextResponse.json({ success: true });
    }

    // All players done — compute winner and wrap up round
    // Winner is closest to 0.82 (82%) without busting (going over 1.0)
    // We compute the distance to 0.82.
    const TARGET = 0.82;
    const nonBusted = state.results.filter(r => !r.busted);
    let winnerId: string;

    if (nonBusted.length > 0) {
      // Closest to TARGET without busting
      const winner = nonBusted.reduce((best, r) => {
        const bestDist = Math.abs(best.fill - TARGET);
        const rDist = Math.abs(r.fill - TARGET);
        return rDist < bestDist ? r : best;
      });
      winnerId = winner.userId;
    } else {
      // All busted — highest fill still wins (closest to 1.0)
      const winner = state.results.reduce((best, r) => (r.fill > best.fill ? r : best));
      winnerId = winner.userId;
    }

    const picked = pickRandomForfeit(state.hostDare);
    state.status = 'ROUND_END';
    state.winnerId = winnerId;
    state.forfeitCategory = picked.category;
    state.forfeitText = picked.text;

    await redis.set(key, state, { ex: 3600 });

    try {
      await serverPusher.trigger(`table-${tableId}`, 'tower-turn-result', { result });
      
      // Pause to let everyone see the final result before round end
      await new Promise(resolve => setTimeout(resolve, 1500));

      await serverPusher.trigger(`table-${tableId}`, 'tower-round-end', {
        winnerId,
        forfeitCategory: picked.category,
        forfeitText: picked.text,
        results: state.results,
      });
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to submit turn:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
