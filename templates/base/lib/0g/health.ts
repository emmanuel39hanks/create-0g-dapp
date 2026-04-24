/**
 * 0G Health Check
 *
 * Aggregates the status of all configured 0G components.
 * Used by the /api/0g/health endpoint.
 */

import {
  loadZeroGEnv,
  isStorageConfigured,
  isComputeConfigured,
  isChainWriteConfigured,
  isDAEnabled,
  validateEnv,
} from './env';
import { getChainHealth } from './chain';
import { listServices } from './compute';

export interface ComponentCheck {
  ok: boolean;
  status: 'connected' | 'disabled' | 'error';
  details?: Record<string, unknown>;
  error?: string;
}

export interface HealthCheckResult {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  network: string;
  envValidation: {
    valid: boolean;
    warnings: string[];
    errors: string[];
  };
  components: {
    chain: ComponentCheck;
    storage: ComponentCheck;
    compute: ComponentCheck;
    da: ComponentCheck;
  };
}

export async function checkHealth(): Promise<HealthCheckResult> {
  const zgEnv = loadZeroGEnv();
  const envValidation = validateEnv();

  const components = {
    chain: await checkChain(),
    storage: checkStorage(),
    compute: await checkCompute(),
    da: checkDA(),
  };

  const allOk = Object.values(components).every(
    (c) => c.ok || c.status === 'disabled'
  );
  const anyError = Object.values(components).some((c) => c.status === 'error');

  return {
    status: anyError ? 'error' : allOk ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    network: zgEnv.chainId === 16661 ? 'mainnet' : 'testnet',
    envValidation,
    components,
  };
}

async function checkChain(): Promise<ComponentCheck> {
  if (!isChainWriteConfigured()) {
    return {
      ok: false,
      status: 'disabled',
      details: { reason: 'ZERO_G_CHAIN_PRIVATE_KEY not set' },
    };
  }

  try {
    const health = await getChainHealth();
    return {
      ok: true,
      status: 'connected',
      details: health,
    };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function checkStorage(): ComponentCheck {
  if (!isStorageConfigured()) {
    return {
      ok: false,
      status: 'disabled',
      details: { reason: 'ZERO_G_STORAGE_INDEXER_URL not set' },
    };
  }

  const zgEnv = loadZeroGEnv();
  return {
    ok: true,
    status: 'connected',
    details: {
      indexerUrl: zgEnv.storageIndexUrl,
      writeEnabled: !!zgEnv.chainPrivateKey,
    },
  };
}

async function checkCompute(): Promise<ComponentCheck> {
  if (!isComputeConfigured()) {
    return {
      ok: false,
      status: 'disabled',
      details: { reason: 'ZERO_G_COMPUTE_ENABLED not true or missing config' },
    };
  }

  try {
    const services = await listServices(5);
    const zgEnv = loadZeroGEnv();
    return {
      ok: true,
      status: 'connected',
      details: {
        model: zgEnv.computeModel,
        serviceCount: services.length,
        services: services.map((s) => s.model),
      },
    };
  } catch (err) {
    return {
      ok: false,
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

function checkDA(): ComponentCheck {
  if (!isDAEnabled()) {
    return {
      ok: false,
      status: 'disabled',
      details: { reason: 'ZERO_G_DA_ENABLED not true' },
    };
  }

  const zgEnv = loadZeroGEnv();
  return {
    ok: true,
    status: 'connected',
    details: {
      grpcUrl: zgEnv.daGrpcUrl,
      tls: zgEnv.daGrpcTls,
    },
  };
}
