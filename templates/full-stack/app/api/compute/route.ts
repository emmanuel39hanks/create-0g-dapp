import { NextResponse } from 'next/server';
import { chat } from '@/lib/0g/compute';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 });
    }

    const response = await chat(message, {
      systemPrompt: 'You are a helpful assistant running on 0G Compute, a decentralized AI infrastructure network. Be concise and helpful.',
    });

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Inference failed' },
      { status: 500 }
    );
  }
}
