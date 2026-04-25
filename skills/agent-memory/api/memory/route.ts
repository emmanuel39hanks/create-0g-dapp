import { NextResponse } from 'next/server';
import { remember, recall, listMemories } from '@/lib/skills/memory-store';

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    const memory = await remember(key, value);
    return NextResponse.json(memory);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get('key');
  if (key) {
    const memory = recall(key);
    return memory ? NextResponse.json(memory) : NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json({ memories: listMemories() });
}
