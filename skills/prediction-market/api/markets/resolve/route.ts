import { NextResponse } from 'next/server';
import { resolveMarket } from '@/lib/skills/prediction-engine';

export async function POST(request: Request) {
  try {
    const market = await request.json();
    if (!market?.id || !market?.question || !market?.options) {
      return NextResponse.json({ error: 'Missing market data' }, { status: 400 });
    }

    const result = await resolveMarket(market);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Resolution failed' }, { status: 500 });
  }
}
