import { NextResponse } from 'next/server';
import { publishJson, downloadJson } from '@/lib/0g/storage';

export async function POST(request: Request) {
  try {
    const { payload } = await request.json();
    if (!payload) return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    const result = await publishJson(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const rootHash = new URL(request.url).searchParams.get('rootHash');
    if (!rootHash) return NextResponse.json({ error: 'Missing rootHash' }, { status: 400 });
    const result = await downloadJson(rootHash);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Download failed' }, { status: 500 });
  }
}
