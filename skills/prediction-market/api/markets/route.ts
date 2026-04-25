import { NextResponse } from 'next/server';
import { evaluateMarket } from '@/lib/skills/prediction-engine';

export async function POST(request: Request) {
  try {
    const { question } = await request.json();
    if (!question) return NextResponse.json({ error: 'Missing question' }, { status: 400 });

    const evaluation = await evaluateMarket(question);
    return NextResponse.json({
      id: `mkt_${Date.now()}`,
      question,
      ...evaluation,
      createdAt: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}
