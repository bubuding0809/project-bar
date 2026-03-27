import { NextResponse } from 'next/server';
import { serverPusher } from '@/lib/pusher-server';
import { redis } from '@/lib/redis';
export async function POST(req: Request) {
  const { tableId } = await req.json();
  await redis.del(`table:${tableId}:game`);
  await serverPusher.trigger(`table-${tableId}`, 'payment_timeout', {});
  return NextResponse.json({ success: true });
}
