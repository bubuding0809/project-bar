import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';
import { BarrelState } from '@/types/barrel';
import { pickRandomForfeit } from '@/data/forfeits';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId, userId, slotIndex } = body;

    if (!tableId || !userId || typeof slotIndex !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const key = `table:${tableId}:barrel`;
    const state = await redis.get<BarrelState>(key);

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

    if (state.filledSlots.includes(slotIndex)) {
      return NextResponse.json({ error: 'Slot already filled' }, { status: 400 });
    }

    if (slotIndex === state.triggerSlot) {
      const picked = pickRandomForfeit();
      state.status = 'ROUND_END';
      state.loserId = userId;
      state.forfeitCategory = picked.category;
      state.forfeitText = picked.text;

      await redis.set(key, state, { ex: 3600 });

      try {
        // Trigger barrel-updated first so all clients get correct state
        await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
        // Then trigger barrel-trigger-hit for haptic/special effects
        await serverPusher.trigger(`table-${tableId}`, 'barrel-trigger-hit', {
          userId,
          slotIndex,
        });
      } catch (pusherError) {
        console.error('Failed to trigger Pusher event:', pusherError);
      }

      return NextResponse.json({ success: true, game: state });
    }

    state.filledSlots.push(slotIndex);

    // Advance to next player
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;

    await redis.set(key, state, { ex: 3600 });

    try {
      // Send sword-inserted for animation, then barrel-updated for state
      await serverPusher.trigger(`table-${tableId}`, 'barrel-sword-inserted', { slotIndex, playerId: userId });
      await serverPusher.trigger(`table-${tableId}`, 'barrel-updated', state);
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true, game: state });
  } catch (error) {
    console.error('Failed to insert sword:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
