export type Template = 'full-stack' | 'ai-agent' | 'storage-dapp' | 'minimal';
export type Network = 'mainnet' | 'testnet';
export type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

export const TEMPLATES: Record<Template, { label: string; hint: string }> = {
  'full-stack': {
    label: 'Full Stack',
    hint: 'All 5 components: Storage, Chain, Compute, KV, DA',
  },
  'ai-agent': {
    label: 'AI Agent',
    hint: 'Compute + Storage — agents that think and remember',
  },
  'storage-dapp': {
    label: 'Storage dApp',
    hint: 'Storage + Chain — data-heavy apps with on-chain anchoring',
  },
  minimal: {
    label: 'Minimal',
    hint: 'SDK helpers only — bring your own logic',
  },
};

export interface NetworkConfig {
  chainId: number;
  chainRpcUrl: string;
  chainScanBaseUrl: string;
  storageIndexUrl: string;
  storageScanBaseUrl: string;
  storageFlowAddress: string;
  daSignersPrecompile: string;
  wrapped0GBasePrecompile: string;
  computeInferencingCA: string;
}

export const NETWORKS: Record<Network, NetworkConfig> = {
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

export const SDK_VERSIONS = {
  '@0gfoundation/0g-ts-sdk': '^1.2.1',
  '@0glabs/0g-serving-broker': '^0.7.4',
  viem: '^2.47.6',
  ethers: '^6.16.0',
  openai: '^4.86.0',
} as const;

export const BASE_DEPS: Record<string, string> = {
  next: '^15.3.1',
  react: '^19.1.0',
  'react-dom': '^19.1.0',
};

export const BASE_DEV_DEPS: Record<string, string> = {
  typescript: '^5.8.3',
  '@types/node': '^22.15.3',
  '@types/react': '^19.1.2',
  '@types/react-dom': '^19.1.2',
  tailwindcss: '^4.1.4',
  '@tailwindcss/postcss': '^4.1.4',
  postcss: '^8.5.3',
  vitest: '^3.1.2',
};

export const TEMPLATE_DEPS: Record<Template, { deps: Record<string, string>; devDeps?: Record<string, string> }> = {
  'full-stack': {
    deps: {
      '@0gfoundation/0g-ts-sdk': SDK_VERSIONS['@0gfoundation/0g-ts-sdk'],
      '@0glabs/0g-serving-broker': SDK_VERSIONS['@0glabs/0g-serving-broker'],
      viem: SDK_VERSIONS.viem,
      ethers: SDK_VERSIONS.ethers,
      openai: SDK_VERSIONS.openai,
    },
  },
  'ai-agent': {
    deps: {
      '@0gfoundation/0g-ts-sdk': SDK_VERSIONS['@0gfoundation/0g-ts-sdk'],
      '@0glabs/0g-serving-broker': SDK_VERSIONS['@0glabs/0g-serving-broker'],
      ethers: SDK_VERSIONS.ethers,
      openai: SDK_VERSIONS.openai,
    },
  },
  'storage-dapp': {
    deps: {
      '@0gfoundation/0g-ts-sdk': SDK_VERSIONS['@0gfoundation/0g-ts-sdk'],
      viem: SDK_VERSIONS.viem,
      ethers: SDK_VERSIONS.ethers,
    },
  },
  minimal: {
    deps: {
      '@0gfoundation/0g-ts-sdk': SDK_VERSIONS['@0gfoundation/0g-ts-sdk'],
      viem: SDK_VERSIONS.viem,
    },
  },
};
