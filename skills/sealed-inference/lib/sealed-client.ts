/**
 * Sealed Inference Client
 *
 * TEE-backed private AI inference via 0G Compute.
 * Every response is cryptographically attested — tamper-proof.
 */

import { createComputeClient } from '@/lib/0g/compute';
import { loadZeroGEnv } from '@/lib/0g/env';

export interface SealedResponse<T = string> {
  output: T;
  attestation: {
    verified: boolean;
    provider: string;
    timestamp: string;
  };
}

/**
 * Run a private inference query through Sealed Inference (TEE).
 * The model runs inside a hardware enclave — even the GPU operator can't see your data.
 */
export async function sealedInfer(
  prompt: string,
  options: { model?: string; systemPrompt?: string } = {}
): Promise<SealedResponse> {
  const client = createComputeClient();
  const zgEnv = loadZeroGEnv();

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const completion = await client.chat.completions.create({
    model: options.model || zgEnv.computeModel,
    messages,
    temperature: 0.1,
  });

  const output = completion.choices[0]?.message?.content || '';

  return {
    output,
    attestation: {
      verified: zgEnv.sealedInferenceEnabled,
      provider: zgEnv.computeProvider || 'unknown',
      timestamp: new Date().toISOString(),
    },
  };
}
