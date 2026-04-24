/**
 * 0G Chain Helpers
 *
 * viem-based client for interacting with 0G Chain (EVM L1).
 * Supports reading chain state and anchoring data hashes on-chain.
 *
 * Requires: viem
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  formatEther,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { loadZeroGEnv, isChainWriteConfigured } from './env';

/** Define the 0G Chain for viem */
function get0GChain() {
  const zgEnv = loadZeroGEnv();
  return defineChain({
    id: zgEnv.chainId,
    name: zgEnv.chainId === 16661 ? '0G Mainnet' : '0G Testnet',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: {
      default: { http: [zgEnv.chainRpcUrl] },
    },
    blockExplorers: {
      default: { name: 'ChainScan', url: zgEnv.chainScanBaseUrl },
    },
  });
}

/** Get a read-only viem public client for 0G Chain */
export function getPublicClient(): PublicClient {
  const chain = get0GChain();
  return createPublicClient({
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  }) as PublicClient;
}

/** Get a viem wallet client for writing to 0G Chain */
export function getWalletClient(): WalletClient {
  if (!isChainWriteConfigured()) {
    throw new Error(
      '0G Chain write operations require ZERO_G_CHAIN_PRIVATE_KEY. ' +
      'Set it in your .env.local file.'
    );
  }

  const zgEnv = loadZeroGEnv();
  const chain = get0GChain();
  const account = privateKeyToAccount(zgEnv.chainPrivateKey as `0x${string}`);

  return createWalletClient({
    account,
    chain,
    transport: http(chain.rpcUrls.default.http[0]),
  });
}

/** Get basic chain health info */
export async function getChainHealth(): Promise<{
  chainId: number;
  latestBlock: number;
  writerBalance: string;
  writerAddress: string | null;
}> {
  const zgEnv = loadZeroGEnv();
  const client = getPublicClient();

  const latestBlock = await client.getBlockNumber();

  let writerBalance = '0';
  let writerAddress: string | null = null;

  if (isChainWriteConfigured()) {
    const account = privateKeyToAccount(zgEnv.chainPrivateKey as `0x${string}`);
    writerAddress = account.address;
    const balance = await client.getBalance({ address: account.address });
    writerBalance = formatEther(balance);
  }

  return {
    chainId: zgEnv.chainId,
    latestBlock: Number(latestBlock),
    writerBalance,
    writerAddress,
  };
}

/**
 * Anchor a data hash on 0G Chain.
 *
 * This is the simplest form of on-chain anchoring — store a hash
 * that proves some data existed at a specific time. For more complex
 * anchoring (with contracts), see the full-stack template.
 *
 * @param dataHash - SHA-256 hash of the data to anchor
 * @returns Transaction hash
 */
export async function anchorHash(dataHash: `0x${string}`): Promise<{
  txHash: `0x${string}`;
  chainId: number;
  blockNumber: number;
}> {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const zgEnv = loadZeroGEnv();

  // Simple approach: send a 0-value tx with the hash as calldata
  const txHash = await wallet.sendTransaction({
    to: wallet.account!.address,
    value: 0n,
    data: dataHash,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  return {
    txHash,
    chainId: zgEnv.chainId,
    blockNumber: Number(receipt.blockNumber),
  };
}
