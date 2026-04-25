import { NextResponse } from 'next/server';
import { publishJson, sha256Hex } from '@/lib/0g/storage';
import { anchorHash } from '@/lib/0g/chain';

export async function POST(request: Request) {
  try {
    const { name, description, image } = await request.json();
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const metadata = { name, description, image, createdAt: Date.now() };
    const storage = await publishJson(metadata);
    const anchor = await anchorHash(sha256Hex(JSON.stringify(metadata)));

    return NextResponse.json({
      name,
      storageUri: storage.storageUri,
      rootHash: storage.rootHash,
      chainTxHash: anchor.txHash,
      metadataHash: sha256Hex(JSON.stringify(metadata)),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mint failed' }, { status: 500 });
  }
}
