import { NextResponse } from 'next/server';
import { serverPusher } from '@/lib/pusher-server';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;
    
    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    const authResponse = serverPusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher auth error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
