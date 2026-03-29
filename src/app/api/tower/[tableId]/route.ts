import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { TowerState } from '@/types/tower';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    const key = `table:${tableId}:tower`;
    const state = await redis.get<TowerState>(key);
    if (!state) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ game: state });
  } catch (error) {
    console.error('Failed to get tower state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
