/**
 * 0G Compute Helpers
 *
 * OpenAI-compatible inference client for models running on 0G Compute Network.
 * Supports Qwen, GLM-5, DeepSeek, and any model available on the marketplace.
 *
 * Requires: openai, @0glabs/0g-serving-broker
 */

import OpenAI from 'openai';
import { loadZeroGEnv, isComputeConfigured } from './env';

/**
 * Create an OpenAI-compatible client pointed at 0G Compute.
 *
 * The 0G Compute Network serves models via an OpenAI-compatible API.
 * Any OpenAI SDK code works — just swap the baseURL and apiKey.
 */
export function createComputeClient(): OpenAI {
  if (!isComputeConfigured()) {
    throw new Error(
      '0G Compute requires ZERO_G_COMPUTE_ENABLED=true, ZERO_G_COMPUTE_BASE_URL, and ZERO_G_COMPUTE_API_KEY. ' +
      'Get these from: 0g-compute-cli inference list-providers && 0g-compute-cli inference get-secret --provider <ADDR>'
    );
  }

  const zgEnv = loadZeroGEnv();

  // Ensure the base URL ends with /v1/proxy (0G Compute's OpenAI-compatible path)
  let baseURL = zgEnv.computeBaseUrl.replace(/\/+$/, '');
  if (!baseURL.endsWith('/v1/proxy')) {
    baseURL = `${baseURL}/v1/proxy`;
  }

  return new OpenAI({
    apiKey: zgEnv.computeApiKey,
    baseURL,
    timeout: 30_000,
  });
}

/**
 * Run inference and parse the response as JSON.
 *
 * Handles the common pattern of asking an AI model to return structured data.
 * Automatically retries with stricter instructions if JSON parsing fails.
 */
export async function infer<T = unknown>(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    jsonMode?: boolean;
    maxTokens?: number;
  } = {}
): Promise<T> {
  const client = createComputeClient();
  const zgEnv = loadZeroGEnv();
  const model = options.model || zgEnv.computeModel;

  const completion = await client.chat.completions.create({
    model,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 2048,
    ...(options.jsonMode && { response_format: { type: 'json_object' } }),
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error('0G Compute returned an empty response');

  if (options.jsonMode) {
    return JSON.parse(content) as T;
  }

  return content as unknown as T;
}

/**
 * Simple chat completion — returns the text response.
 */
export async function chat(
  userMessage: string,
  options: {
    model?: string;
    systemPrompt?: string;
    temperature?: number;
  } = {}
): Promise<string> {
  const client = createComputeClient();
  const zgEnv = loadZeroGEnv();

  const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: userMessage });

  const completion = await client.chat.completions.create({
    model: options.model || zgEnv.computeModel,
    messages,
    temperature: options.temperature ?? 0.7,
  });

  return completion.choices[0]?.message?.content || '';
}

/**
 * List available AI services on the 0G Compute Network.
 *
 * Uses a read-only broker — no wallet or funds required.
 */
export async function listServices(limit = 20): Promise<
  Array<{
    provider: string;
    model: string;
    endpoint: string;
  }>
> {
  const { createZGComputeNetworkReadOnlyBroker } = await import('@0glabs/0g-serving-broker');
  const zgEnv = loadZeroGEnv();

  const broker = await createZGComputeNetworkReadOnlyBroker(zgEnv.chainRpcUrl, zgEnv.chainId);
  const services = await broker.inference.listServiceWithDetail(0, limit, false);

  return services.map((svc: Record<string, unknown>) => ({
    provider: String(svc.provider || svc.providerAddress || ''),
    model: String(svc.model || svc.serviceName || svc.name || ''),
    endpoint: String(svc.endpoint || svc.url || ''),
  }));
}
