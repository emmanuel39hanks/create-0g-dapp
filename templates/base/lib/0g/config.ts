/**
 * 0G Network Configuration
 *
 * Resolves correct addresses, RPCs, and contract details for mainnet vs testnet.
 * Call assertNetworkMatch() on first use to catch chain mismatch bugs early.
 */

export type ZeroGNetwork = 'mainnet' | 'testnet';

export interface NetworkConfig {
  chainId: number;
  chainRpcUrl: string;
  chainScanBaseUrl: string;
  storageIndexUrl: string;
  storageScanBaseUrl: string;
  storageFlowAddress: string;
  daSignersPrecompile: `0x${string}`;
  wrapped0GBasePrecompile: `0x${string}`;
  computeInferencingCA: `0x${string}`;
}

const CONFIGS: Record<ZeroGNetwork, NetworkConfig> = {
  mainnet: {
    chainId: 16661,
    chainRpcUrl: 'https://evmrpc.0g.ai',
    chainScanBaseUrl: 'https://chainscan.0g.ai',
    storageIndexUrl: 'https://indexer-storage-turbo.0g.ai',
    storageScanBaseUrl: 'https://storagescan.0g.ai',
    storageFlowAddress: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526',
    daSignersPrecompile: '0x0000000000000000000000000000000000001000',
    wrapped0GBasePrecompile: '0x0000000000000000000000000000000000001002',
    computeInferencingCA: '0x47340d900bdFec2BD393c626E12ea0656F938d84',
  },
  testnet: {
    chainId: 16600,
    chainRpcUrl: 'https://evmrpc-testnet.0g.ai',
    chainScanBaseUrl: 'https://chainscan-testnet.0g.ai',
    storageIndexUrl: 'https://indexer-storage-turbo-testnet.0g.ai',
    storageScanBaseUrl: 'https://storagescan-testnet.0g.ai',
    storageFlowAddress: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526',
    daSignersPrecompile: '0x0000000000000000000000000000000000001000',
    wrapped0GBasePrecompile: '0x0000000000000000000000000000000000001002',
    computeInferencingCA: '0xa79F4c8311FF93C06b8CfB403690cc987c93F91E',
  },
};

export function getNetworkConfig(network: ZeroGNetwork): NetworkConfig {
  return CONFIGS[network];
}

export function detectNetwork(chainId: number): ZeroGNetwork | null {
  if (chainId === 16661) return 'mainnet';
  if (chainId === 16600) return 'testnet';
  return null;
}

/**
 * Fetch the actual chain ID from the RPC and verify it matches config.
 * Call this once on startup to catch the #1 most common 0G integration bug.
 *
 * @throws Error with a clear message if chain IDs don't match
 */
export async function assertNetworkMatch(
  rpcUrl: string,
  expectedChainId: number
): Promise<void> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_chainId',
      params: [],
      id: 1,
    }),
  });

  const data = await res.json();
  const actualChainId = parseInt(data.result, 16);

  if (actualChainId !== expectedChainId) {
    const expectedNetwork = detectNetwork(expectedChainId) || 'unknown';
    const actualNetwork = detectNetwork(actualChainId) || 'unknown';
    throw new Error(
      `0G network mismatch — configured ZERO_G_CHAIN_ID=${expectedChainId} (${expectedNetwork}) ` +
      `but RPC at ${rpcUrl} returned chainId=${actualChainId} (${actualNetwork}). ` +
      `Update ZERO_G_CHAIN_RPC_URL or ZERO_G_CHAIN_ID in your .env.local file.`
    );
  }
}
