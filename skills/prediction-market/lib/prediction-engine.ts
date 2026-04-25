/**
 * Prediction Market Engine
 *
 * Uses 0G Compute to evaluate and resolve prediction markets.
 * Market outcomes are stored on 0G Storage for permanent proof.
 */

import { infer } from '@/lib/0g/compute';
import { publishJson, sha256Hex } from '@/lib/0g/storage';
import { anchorHash } from '@/lib/0g/chain';

export interface Market {
  id: string;
  question: string;
  description: string;
  options: string[];
  createdAt: number;
  resolvedAt?: number;
  outcome?: string;
  proof?: { storageUri: string; chainTxHash: string };
}

/**
 * Evaluate whether a prediction market question can be auto-resolved.
 * Uses 0G Compute (Qwen) to analyze the question.
 */
export async function evaluateMarket(question: string): Promise<{
  canAutoResolve: boolean;
  category: string;
  reasoning: string;
  suggestedOptions: string[];
}> {
  return infer<{
    canAutoResolve: boolean;
    category: string;
    reasoning: string;
    suggestedOptions: string[];
  }>(
    [
      {
        role: 'system',
        content: `You are a prediction market evaluator. Analyze questions and determine:
1. Can this be auto-resolved using public data? (crypto prices, sports scores, weather, elections)
2. What category is it? (crypto, sports, politics, science, other)
3. Brief reasoning
4. Suggested YES/NO or multi-choice options

Return JSON with: canAutoResolve (boolean), category (string), reasoning (string), suggestedOptions (string[])`,
      },
      { role: 'user', content: question },
    ],
    { jsonMode: true, temperature: 0.1 }
  );
}

/**
 * Resolve a market using 0G Compute AI oracle.
 * The resolution reasoning is stored on 0G Storage and anchored on 0G Chain.
 */
export async function resolveMarket(market: Market): Promise<{
  outcome: string;
  reasoning: string;
  storageUri: string;
  chainTxHash: string;
}> {
  // AI determines the outcome
  const resolution = await infer<{ outcome: string; reasoning: string; confidence: number }>(
    [
      {
        role: 'system',
        content: `You are an AI oracle for prediction markets. Determine the outcome of this market based on publicly available information. Return JSON with: outcome (one of the options), reasoning (brief explanation), confidence (0-1).`,
      },
      {
        role: 'user',
        content: `Question: ${market.question}\nOptions: ${market.options.join(', ')}\nCreated: ${new Date(market.createdAt).toISOString()}`,
      },
    ],
    { jsonMode: true, temperature: 0 }
  );

  // Store resolution proof on 0G Storage
  const proof = {
    marketId: market.id,
    question: market.question,
    outcome: resolution.outcome,
    reasoning: resolution.reasoning,
    confidence: resolution.confidence,
    resolvedAt: Date.now(),
    oracleModel: process.env.PREDICTION_ORACLE_MODEL || 'qwen3.6-plus',
  };

  const storageResult = await publishJson(proof);

  // Anchor proof hash on 0G Chain
  const proofHash = sha256Hex(JSON.stringify(proof));
  const chainResult = await anchorHash(proofHash);

  return {
    outcome: resolution.outcome,
    reasoning: resolution.reasoning,
    storageUri: storageResult.storageUri,
    chainTxHash: chainResult.txHash,
  };
}
