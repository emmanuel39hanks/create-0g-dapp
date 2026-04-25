/**
 * Agent Memory Store
 *
 * Persistent memory for AI agents using 0G Storage.
 * Agents can save and recall information across sessions.
 */

import { publishJson, downloadJson, sha256Hex } from '@/lib/0g/storage';

export interface Memory {
  key: string;
  value: unknown;
  timestamp: number;
  rootHash?: string;
}

const memoryIndex = new Map<string, Memory>();

/** Store a memory on 0G Storage */
export async function remember(key: string, value: unknown): Promise<Memory> {
  const memory: Memory = { key, value, timestamp: Date.now() };
  const result = await publishJson(memory);
  memory.rootHash = result.rootHash;
  memoryIndex.set(key, memory);
  return memory;
}

/** Recall a memory by key (from local index) */
export function recall(key: string): Memory | null {
  return memoryIndex.get(key) || null;
}

/** Recall a memory from 0G Storage by root hash */
export async function recallFromStorage<T = unknown>(rootHash: string): Promise<T> {
  const result = await downloadJson<T>(rootHash);
  return result.data;
}

/** List all memories in the current session */
export function listMemories(): Memory[] {
  return Array.from(memoryIndex.values()).sort((a, b) => b.timestamp - a.timestamp);
}
