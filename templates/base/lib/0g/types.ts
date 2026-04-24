/**
 * Shared 0G types used across the application.
 */

export interface StorageArtifact {
  rootHash: string;
  storageUri: string;
  txHash: string;
}

export interface ChainAnchor {
  txHash: `0x${string}`;
  chainId: number;
  blockNumber: number;
}

export interface ComputeService {
  provider: string;
  model: string;
  endpoint: string;
}

export interface InferenceResult<T = unknown> {
  output: T;
  model: string;
  provider: string | null;
}
