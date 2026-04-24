import { NextResponse } from 'next/server';
import { mintINFT, type INFTMetadata } from '@/lib/0g/inft';

export async function POST(request: Request) {
  try {
    const { contractAddress, to, metadata } = await request.json();
    if (!contractAddress || !to || !metadata?.name) {
      return NextResponse.json({ error: 'Missing contractAddress, to, or metadata.name' }, { status: 400 });
    }

    const result = await mintINFT(
      contractAddress as `0x${string}`,
      to as `0x${string}`,
      metadata as INFTMetadata
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Mint failed' },
      { status: 500 }
    );
  }
}
