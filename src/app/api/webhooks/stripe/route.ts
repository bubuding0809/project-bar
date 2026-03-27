import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher';
import { GameState } from '@/types/game';

// This is a placeholder for the actual Stripe webhook.
// For the MVP we simulate payment via /api/game/pay endpoint.
export async function POST(request: Request) {
  try {
    // In a real app, verify Stripe signature here.
    const body = await request.text();
    // const event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    
    // Simulating event parsing
    const event = JSON.parse(body);

    if (event.type === 'payment_intent.succeeded') {
      const tableId = event.data.object.metadata.tableId;
      if (tableId) {
        const gameKey = `table:${tableId}:game`;
        const gameState = await redis.get<GameState>(gameKey);

        if (gameState) {
          gameState.status = 'PAID';
          await redis.set(gameKey, gameState, { ex: 3600 });
          await serverPusher.trigger(`table-${tableId}`, 'game-paid', { tableId });
          await serverPusher.trigger(`table-${tableId}`, 'game-updated', gameState);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
