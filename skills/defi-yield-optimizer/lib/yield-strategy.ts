/**
 * DeFi Yield Strategy Engine
 *
 * Uses 0G Compute to analyze yield opportunities and recommend strategies.
 * All decisions are logged to 0G Storage for auditability.
 */

import { infer } from '@/lib/0g/compute';
import { publishJson } from '@/lib/0g/storage';

export interface YieldOpportunity {
  protocol: string;
  asset: string;
  apy: number;
  risk: 'low' | 'medium' | 'high';
  chain: string;
}

export async function analyzeYield(opportunities: YieldOpportunity[]): Promise<{
  recommendation: string;
  allocation: Array<{ protocol: string; percentage: number; reasoning: string }>;
  riskScore: number;
  storageUri?: string;
}> {
  const analysis = await infer<{
    recommendation: string;
    allocation: Array<{ protocol: string; percentage: number; reasoning: string }>;
    riskScore: number;
  }>(
    [
      {
        role: 'system',
        content: `You are a DeFi yield optimization AI. Analyze opportunities and recommend an optimal allocation strategy. Consider risk, APY sustainability, and diversification. Return JSON with: recommendation (string), allocation (array of {protocol, percentage, reasoning}), riskScore (0-1).`,
      },
      {
        role: 'user',
        content: `Analyze these yield opportunities:\n${JSON.stringify(opportunities, null, 2)}`,
      },
    ],
    { jsonMode: true, temperature: 0 }
  );

  // Log decision to 0G Storage for auditability
  const proof = await publishJson({
    type: 'yield_analysis',
    input: opportunities,
    output: analysis,
    timestamp: Date.now(),
  });

  return { ...analysis, storageUri: proof.storageUri };
}
