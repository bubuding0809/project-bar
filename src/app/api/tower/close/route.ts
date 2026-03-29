import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { serverPusher } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tableId } = body;

    if (!tableId) {
      return NextResponse.json({ error: 'Missing tableId' }, { status: 400 });
    }

    const key = `table:${tableId}:tower`;
    await redis.del(key);

    try {
      await serverPusher.trigger(`table-${tableId}`, 'tower-lobby-closed', {});
    } catch (pusherError) {
      console.error('Failed to trigger Pusher event:', pusherError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to close tower game:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
