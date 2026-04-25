/**
 * Trading Bot Engine
 *
 * Autonomous trading agent powered by 0G Compute.
 * All trade decisions are anchored on 0G Chain for verifiability.
 */

import { infer } from '@/lib/0g/compute';
import { publishJson } from '@/lib/0g/storage';
import { anchorHash } from '@/lib/0g/chain';
import { sha256Hex } from '@/lib/0g/storage';

export async function evaluateTrade(data: {
  asset: string;
  currentPrice: number;
  historicalPrices: number[];
  indicators?: Record<string, number>;
}): Promise<{
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  storageUri: string;
  chainTxHash: string;
}> {
  const decision = await infer<{ action: 'buy' | 'sell' | 'hold'; confidence: number; reasoning: string }>(
    [
      { role: 'system', content: 'You are a trading strategy AI. Analyze market data and recommend an action. Return JSON: { action: "buy"|"sell"|"hold", confidence: 0-1, reasoning: "..." }' },
      { role: 'user', content: JSON.stringify(data) },
    ],
    { jsonMode: true, temperature: 0 }
  );

  const proof = await publishJson({ ...decision, input: data, timestamp: Date.now() });
  const anchor = await anchorHash(sha256Hex(JSON.stringify(decision)));

  return { ...decision, storageUri: proof.storageUri, chainTxHash: anchor.txHash };
}
