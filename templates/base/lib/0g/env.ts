/**
 * 0G Environment Configuration
 *
 * Loads and validates all 0G-related environment variables.
 * Each component (Storage, Chain, Compute, DA) can be independently enabled.
 */

export interface ZeroGEnv {
  // Master switch
  enabled: boolean;

  // Chain
  chainRpcUrl: string;
  chainId: number;
  chainPrivateKey: string;
  chainScanBaseUrl: string;

  // Storage (Log + KV)
  storageIndexUrl: string;
  storageKvRpcUrl: string;
  storageFlowAddress: string;
  storageStreamId: string;
  storageEncryptionKey: string;
  storageScanBaseUrl: string;

  // Compute
  computeEnabled: boolean;
  computeProvider: string;
  computeBaseUrl: string;
  computeApiKey: string;
  computeModel: string;
  sealedInferenceEnabled: boolean;

  // DA
  daEnabled: boolean;
  daGrpcUrl: string;
  daGrpcTls: boolean;
}

function env(key: string, fallback = ''): string {
  return process.env[key] || fallback;
}

export function loadZeroGEnv(): ZeroGEnv {
  return {
    enabled: env('ZERO_G_ENABLED') === 'true',
    chainRpcUrl: env('ZERO_G_CHAIN_RPC_URL', 'https://evmrpc.0g.ai'),
    chainId: parseInt(env('ZERO_G_CHAIN_ID', '16661'), 10),
    chainPrivateKey: env('ZERO_G_CHAIN_PRIVATE_KEY'),
    chainScanBaseUrl: env('ZERO_G_CHAINSCAN_URL', 'https://chainscan.0g.ai'),
    storageIndexUrl: env('ZERO_G_STORAGE_INDEXER_URL', 'https://indexer-storage-turbo.0g.ai'),
    storageKvRpcUrl: env('ZERO_G_STORAGE_KV_RPC_URL'),
    storageFlowAddress: env('ZERO_G_STORAGE_FLOW_ADDRESS', '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526'),
    storageStreamId: env('ZERO_G_STORAGE_STREAM_ID'),
    storageEncryptionKey: env('ZERO_G_STORAGE_ENCRYPTION_KEY'),
    storageScanBaseUrl: env('ZERO_G_STORAGESCAN_URL', 'https://storagescan.0g.ai'),
    computeEnabled: env('ZERO_G_COMPUTE_ENABLED') === 'true',
    computeProvider: env('ZERO_G_COMPUTE_PROVIDER'),
    computeBaseUrl: env('ZERO_G_COMPUTE_BASE_URL'),
    computeApiKey: env('ZERO_G_COMPUTE_API_KEY'),
    computeModel: env('ZERO_G_COMPUTE_MODEL', 'qwen3.6-plus'),
    sealedInferenceEnabled: env('ZERO_G_SEALED_INFERENCE_ENABLED') === 'true',
    daEnabled: env('ZERO_G_DA_ENABLED') === 'true',
    daGrpcUrl: env('ZERO_G_DA_GRPC_URL', 'localhost:51001'),
    daGrpcTls: env('ZERO_G_DA_GRPC_TLS') === 'true',
  };
}

/** Check if 0G Storage reads are possible (no private key needed) */
export function isStorageConfigured(): boolean {
  return !!env('ZERO_G_STORAGE_INDEXER_URL');
}

/** Check if 0G Storage writes are possible (needs private key) */
export function isStorageWriteConfigured(): boolean {
  return isStorageConfigured() && !!env('ZERO_G_CHAIN_PRIVATE_KEY');
}

/** Check if 0G Chain writes are possible */
export function isChainWriteConfigured(): boolean {
  return !!env('ZERO_G_CHAIN_PRIVATE_KEY');
}

/** Check if 0G Compute is configured */
export function isComputeConfigured(): boolean {
  return env('ZERO_G_COMPUTE_ENABLED') === 'true'
    && !!env('ZERO_G_COMPUTE_BASE_URL')
    && !!env('ZERO_G_COMPUTE_API_KEY');
}

/** Check if KV writes are possible */
export function isKVConfigured(): boolean {
  return isStorageWriteConfigured() && !!env('ZERO_G_STORAGE_STREAM_ID');
}

/** Check if DA is enabled */
export function isDAEnabled(): boolean {
  return env('ZERO_G_DA_ENABLED') === 'true';
}

export interface EnvValidation {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

/** Validate environment and return actionable feedback */
export function validateEnv(): EnvValidation {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (env('ZERO_G_ENABLED') !== 'true') {
    warnings.push('ZERO_G_ENABLED is not true — all 0G features are disabled');
  }

  if (!env('ZERO_G_CHAIN_PRIVATE_KEY')) {
    warnings.push('ZERO_G_CHAIN_PRIVATE_KEY is not set — Storage uploads and Chain anchoring will not work');
  }

  if (!env('ZERO_G_STORAGE_INDEXER_URL')) {
    warnings.push('ZERO_G_STORAGE_INDEXER_URL is not set — Storage reads/writes disabled');
  }

  if (env('ZERO_G_COMPUTE_ENABLED') === 'true') {
    if (!env('ZERO_G_COMPUTE_BASE_URL')) {
      errors.push('ZERO_G_COMPUTE_ENABLED is true but ZERO_G_COMPUTE_BASE_URL is missing');
    }
    if (!env('ZERO_G_COMPUTE_API_KEY')) {
      errors.push('ZERO_G_COMPUTE_ENABLED is true but ZERO_G_COMPUTE_API_KEY is missing');
    }
  }

  const chainId = parseInt(env('ZERO_G_CHAIN_ID', '16661'), 10);
  const rpcUrl = env('ZERO_G_CHAIN_RPC_URL', '');
  if (rpcUrl.includes('testnet') && chainId === 16661) {
    errors.push('Chain mismatch: RPC URL contains "testnet" but ZERO_G_CHAIN_ID is 16661 (mainnet)');
  }
  if (!rpcUrl.includes('testnet') && chainId === 16600) {
    errors.push('Chain mismatch: RPC URL looks like mainnet but ZERO_G_CHAIN_ID is 16600 (testnet)');
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}
