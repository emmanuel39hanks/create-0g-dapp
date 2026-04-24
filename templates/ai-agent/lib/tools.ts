/**
 * Agent Tool Definitions
 *
 * Define tools your agent can call. These follow the OpenAI function-calling format
 * and work with any OpenAI-compatible model (including Qwen on 0G Compute).
 *
 * Add your own tools here — the agent will automatically discover and use them.
 */

import type { ChatCompletionTool } from 'openai/resources/chat/completions';

export const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'store_data',
      description: 'Upload JSON data to 0G Storage (immutable). Returns the root hash for later retrieval.',
      parameters: {
        type: 'object',
        properties: {
          data: { type: 'object', description: 'The JSON data to store' },
          label: { type: 'string', description: 'A human-readable label for this data' },
        },
        required: ['data'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'retrieve_data',
      description: 'Download data from 0G Storage by root hash. Returns the stored JSON.',
      parameters: {
        type: 'object',
        properties: {
          rootHash: { type: 'string', description: 'The 0G Storage root hash' },
        },
        required: ['rootHash'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'anchor_proof',
      description: 'Anchor a data hash on 0G Chain for permanent, verifiable proof.',
      parameters: {
        type: 'object',
        properties: {
          data: { type: 'string', description: 'The data to hash and anchor on-chain' },
        },
        required: ['data'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_compute_services',
      description: 'List available AI models on the 0G Compute Network.',
      parameters: {
        type: 'object',
        properties: {
          limit: { type: 'number', description: 'Max services to return (default 10)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_health',
      description: 'Check the health status of all 0G components (Storage, Chain, Compute, DA).',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];
