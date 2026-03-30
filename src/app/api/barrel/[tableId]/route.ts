import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { BarrelState } from '@/types/barrel';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    const key = `table:${tableId}:barrel`;
    const state = await redis.get<BarrelState>(key);

    if (!state) {
      return NextResponse.json({ game: null });
    }

    return NextResponse.json({ game: state });
  } catch (error) {
    console.error('Failed to get barrel state:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
