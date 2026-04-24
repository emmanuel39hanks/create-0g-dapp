import { NextResponse } from 'next/server';
import { getINFTToken } from '@/lib/0g/inft';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contract');
    const tokenId = searchParams.get('tokenId');

    if (!contractAddress || !tokenId) {
      return NextResponse.json({ error: 'Missing contract or tokenId' }, { status: 400 });
    }

    const result = await getINFTToken(
      contractAddress as `0x${string}`,
      BigInt(tokenId)
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Token lookup failed' },
      { status: 500 }
    );
  }
}
