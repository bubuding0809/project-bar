import { NextResponse } from 'next/server';
import { serverPusher } from '@/lib/pusher-server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableId, userId, fill } = body;

    if (!tableId || !userId || typeof fill !== 'number') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (serverPusher) {
      await serverPusher.trigger(`table-${tableId}`, 'tower-turn-progress', { userId, fill });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to broadcast tower progress:', error);
    return NextResponse.json({ error: 'Failed to broadcast progress' }, { status: 500 });
  }
}
