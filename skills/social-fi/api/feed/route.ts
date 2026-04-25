import { NextResponse } from 'next/server';
import { publishJson } from '@/lib/0g/storage';
import { anchorHash } from '@/lib/0g/chain';
import { sha256Hex } from '@/lib/0g/storage';

const posts: Array<{ id: string; content: string; author: string; timestamp: number; storageUri: string }> = [];

export async function POST(request: Request) {
  try {
    const { content, author } = await request.json();
    if (!content) return NextResponse.json({ error: 'Missing content' }, { status: 400 });

    const post = { id: `post_${Date.now()}`, content, author: author || 'anonymous', timestamp: Date.now() };
    const storage = await publishJson(post);
    await anchorHash(sha256Hex(JSON.stringify(post)));

    const full = { ...post, storageUri: storage.storageUri };
    posts.unshift(full);
    return NextResponse.json(full);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ posts });
}
