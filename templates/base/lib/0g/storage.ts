/**
 * 0G Storage Helpers
 *
 * Simplified interface for uploading and downloading data on 0G Storage.
 * Uses the immutable Log layer (append-only, content-addressed).
 *
 * Requires: @0gfoundation/0g-ts-sdk, ethers
 */

import { createHash } from 'crypto';
import { Wallet, JsonRpcProvider } from 'ethers';
import { Indexer, ZgFile } from '@0gfoundation/0g-ts-sdk';
import { loadZeroGEnv, isStorageWriteConfigured } from './env';
import { tmpdir } from 'os';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';

/** Compute SHA-256 hash of a string or buffer, returns 0x-prefixed hex */
export function sha256Hex(input: string | Uint8Array): `0x${string}` {
  const hash = createHash('sha256');
  hash.update(typeof input === 'string' ? input : Buffer.from(input));
  return `0x${hash.digest('hex')}` as `0x${string}`;
}

/** Deterministic JSON stringification (sorted keys) */
export function stableJsonStringify(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as Record<string, unknown>).sort());
}

/**
 * Upload a JSON object to 0G Storage (immutable log layer).
 *
 * @returns Root hash (content address), storage URI, and tx hash
 * @throws If storage write is not configured (missing private key)
 */
export async function publishJson(payload: unknown): Promise<{
  rootHash: string;
  storageUri: string;
  txHash: string;
}> {
  if (!isStorageWriteConfigured()) {
    throw new Error(
      '0G Storage write requires ZERO_G_CHAIN_PRIVATE_KEY and ZERO_G_STORAGE_INDEXER_URL. ' +
      'Set these in your .env.local file.'
    );
  }

  const zgEnv = loadZeroGEnv();
  const provider = new JsonRpcProvider(zgEnv.chainRpcUrl);
  const signer = new Wallet(zgEnv.chainPrivateKey, provider);

  const indexer = new Indexer(zgEnv.storageIndexUrl);

  // Write payload to a temp file (SDK requires file path)
  const content = JSON.stringify(payload, null, 2);
  const dir = join(tmpdir(), `0g-upload-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, 'data.json');
  await writeFile(filePath, content);

  const zgFile = await ZgFile.fromFilePath(filePath);

  // SDK upload: (file, rpcUrl, signer)
  const uploadResult = await indexer.upload(zgFile, zgEnv.chainRpcUrl, signer) as unknown;

  await zgFile.close();

  // Handle different SDK response formats
  let txHash = '';
  let rootHash = '';

  if (Array.isArray(uploadResult)) {
    const err = uploadResult[0] as Error | null;
    const hash = uploadResult[1] as string;
    if (err) throw err;
    rootHash = hash;
  } else if (typeof uploadResult === 'object' && uploadResult !== null) {
    const r = uploadResult as Record<string, unknown>;
    txHash = String(r.txHash || '');
    rootHash = String(r.rootHash || '');
  } else {
    rootHash = String(uploadResult);
  }

  return {
    rootHash,
    storageUri: `0g://log/${rootHash}`,
    txHash,
  };
}

/**
 * Download and parse a JSON object from 0G Storage by root hash.
 *
 * @returns Parsed data, byte size, and download duration
 */
export async function downloadJson<T = unknown>(rootHash: string): Promise<{
  data: T;
  byteSize: number;
  durationMs: number;
}> {
  const zgEnv = loadZeroGEnv();
  const indexer = new Indexer(zgEnv.storageIndexUrl);

  const dir = join(tmpdir(), `0g-download-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, 'data.json');

  const start = Date.now();
  await indexer.download(rootHash, filePath, true);
  const durationMs = Date.now() - start;

  const content = await readFile(filePath, 'utf-8');

  return {
    data: JSON.parse(content) as T,
    byteSize: Buffer.byteLength(content),
    durationMs,
  };
}
