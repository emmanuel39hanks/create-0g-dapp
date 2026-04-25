import { createConfig, http } from 'wagmi';
import { defineChain } from 'viem';
import { injected, metaMask } from 'wagmi/connectors';

const chainId = parseInt(process.env.NEXT_PUBLIC_0G_CHAIN_ID || '16661', 10);
const rpcUrl = process.env.NEXT_PUBLIC_0G_RPC_URL || 'https://evmrpc.0g.ai';
const isTestnet = chainId === 16600;

export const zgChain = defineChain({
  id: chainId,
  name: isTestnet ? '0G Testnet' : '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: {
      name: 'ChainScan',
      url: isTestnet ? 'https://chainscan-testnet.0g.ai' : 'https://chainscan.0g.ai',
    },
  },
  testnet: isTestnet,
});

export const wagmiConfig = createConfig({
  chains: [zgChain],
  connectors: [metaMask(), injected()],
  transports: { [zgChain.id]: http() },
  ssr: true,
});
