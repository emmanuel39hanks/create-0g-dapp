import { NextResponse } from 'next/server';
import { analyzeYield, type YieldOpportunity } from '@/lib/skills/yield-strategy';

export async function POST(request: Request) {
  try {
    const { opportunities } = await request.json();
    if (!opportunities?.length) return NextResponse.json({ error: 'Missing opportunities' }, { status: 400 });
    const result = await analyzeYield(opportunities as YieldOpportunity[]);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
