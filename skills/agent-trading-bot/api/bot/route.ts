import { NextResponse } from 'next/server';
import { evaluateTrade } from '@/lib/skills/trading-engine';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data?.asset) return NextResponse.json({ error: 'Missing asset' }, { status: 400 });
    const result = await evaluateTrade(data);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
