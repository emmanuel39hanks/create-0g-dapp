import { NextResponse } from 'next/server';
import { sealedInfer } from '@/lib/skills/sealed-client';

export async function POST(request: Request) {
  try {
    const { prompt, systemPrompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    const result = await sealedInfer(prompt, { systemPrompt });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Inference failed' }, { status: 500 });
  }
}
