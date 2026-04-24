/**
 * Streaming Chat API with Tool Calling
 *
 * Uses 0G Compute (Qwen/GLM/DeepSeek) for reasoning and executes tools
 * against 0G Storage, Chain, and Compute.
 *
 * The agent loop: User message → Model thinks → Calls tools → Model responds
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { tools } from '@/lib/tools';
import { executeTool } from '@/lib/tool-executor';

const SYSTEM_PROMPT = `You are an AI agent running on 0G Compute — a decentralized AI infrastructure network.

You have access to tools that interact with the 0G network:
- **store_data**: Upload data to 0G Storage (immutable, content-addressed)
- **retrieve_data**: Download data from 0G Storage by root hash
- **anchor_proof**: Anchor a hash on 0G Chain for permanent proof
- **list_compute_services**: See what AI models are available on 0G
- **check_health**: Check the status of all 0G components

When you use tools, briefly explain what you're doing and why. Show the results clearly.

Be concise, helpful, and action-oriented. You're an autonomous agent — act decisively.`;

const MAX_TOOL_ROUNDS = 6;

export const maxDuration = 60;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ZERO_G_COMPUTE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI provider not configured. Set ZERO_G_COMPUTE_API_KEY in .env.local' }, { status: 500 });
  }

  const body = await req.json();
  const clientMessages = body.messages as Array<{ role: string; content: string }>;

  const openai = new OpenAI({
    apiKey,
    ...(process.env.OPENAI_BASE_URL && { baseURL: process.env.OPENAI_BASE_URL }),
    ...(process.env.ZERO_G_COMPUTE_BASE_URL && {
      baseURL: process.env.ZERO_G_COMPUTE_BASE_URL.replace(/\/+$/, '') + '/v1/proxy',
    }),
  });
  const model = process.env.OPENAI_MODEL || process.env.ZERO_G_COMPUTE_MODEL || 'qwen3.6-plus';

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...clientMessages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }

      try {
        for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
          const completion = await openai.chat.completions.create({
            model,
            messages,
            tools,
            tool_choice: 'auto',
            stream: true,
          });

          let assistantContent = '';
          const toolCalls: Map<number, { id: string; name: string; arguments: string }> = new Map();
          let finishReason: string | null = null;

          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta;
            finishReason = chunk.choices[0]?.finish_reason ?? finishReason;

            if (delta?.content) {
              assistantContent += delta.content;
              send({ type: 'text_delta', content: delta.content });
            }

            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const existing = toolCalls.get(tc.index);
                if (existing) {
                  existing.arguments += tc.function?.arguments || '';
                } else {
                  toolCalls.set(tc.index, {
                    id: tc.id || '',
                    name: tc.function?.name || '',
                    arguments: tc.function?.arguments || '',
                  });
                }
              }
            }
          }

          if (finishReason !== 'tool_calls' || toolCalls.size === 0) {
            if (assistantContent) {
              messages.push({ role: 'assistant', content: assistantContent });
            }
            break;
          }

          const toolCallsArray = Array.from(toolCalls.values()).map((tc) => ({
            id: tc.id,
            type: 'function' as const,
            function: { name: tc.name, arguments: tc.arguments },
          }));

          messages.push({
            role: 'assistant',
            content: assistantContent || null,
            tool_calls: toolCallsArray,
          });

          for (const tc of toolCallsArray) {
            let parsedArgs: Record<string, unknown> = {};
            try { parsedArgs = JSON.parse(tc.function.arguments || '{}'); } catch { /* empty */ }
            send({ type: 'tool_start', toolName: tc.function.name, toolArgs: parsedArgs });

            let result: Record<string, unknown>;
            try {
              result = await executeTool(tc.function.name, parsedArgs);
            } catch (e) {
              result = { error: e instanceof Error ? e.message : 'Tool execution failed' };
            }

            send({ type: 'tool_result', toolName: tc.function.name, toolResult: result });

            messages.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: JSON.stringify(result),
            });
          }
        }

        send({ type: 'done' });
      } catch (e) {
        send({ type: 'error', error: e instanceof Error ? e.message : 'Unknown error' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
