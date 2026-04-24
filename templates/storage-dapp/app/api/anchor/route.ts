import { NextResponse } from 'next/server';
import { anchorHash } from '@/lib/0g/chain';
import { sha256Hex } from '@/lib/0g/storage';
import { loadZeroGEnv } from '@/lib/0g/env';

export async function POST(request: Request) {
  try {
    const { data } = await request.json();
    if (!data) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    const dataHash = sha256Hex(typeof data === 'string' ? data : JSON.stringify(data));
    const result = await anchorHash(dataHash);
    const zgEnv = loadZeroGEnv();
    return NextResponse.json({ dataHash, ...result, explorerUrl: `${zgEnv.chainScanBaseUrl}/tx/${result.txHash}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Anchor failed' }, { status: 500 });
  }
}
