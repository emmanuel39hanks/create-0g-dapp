/**
 * 0G INFT (Intelligent NFT) Helpers
 *
 * Mint ERC-721 tokens with metadata stored on 0G Storage.
 * The storageRoot and metadataHash are recorded on-chain,
 * making metadata verifiable and tamper-proof.
 *
 * Requires: viem, @0gfoundation/0g-ts-sdk
 */

import { createHash } from 'crypto';
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  parseAbi,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { publishJson, sha256Hex } from './storage';
import { loadZeroGEnv, isChainWriteConfigured } from './env';

const INFT_ABI = parseAbi([
  'function mint(address to, bytes32 storageRoot, bytes32 metadataHash) external returns (uint256)',
  'function tokenURI(uint256 tokenId) external view returns (string)',
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function totalSupply() external view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]);

export interface INFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  [key: string]: unknown;
}

export interface MintResult {
  tokenId: string;
  storageRoot: string;
  storageUri: string;
  metadataHash: string;
  txHash: string;
  owner: string;
}

/**
 * Mint an INFT: upload metadata to 0G Storage, then mint on-chain.
 *
 * @param contractAddress - Deployed INFT contract address
 * @param to - Recipient address
 * @param metadata - NFT metadata (name, description, image, attributes)
 */
export async function mintINFT(
  contractAddress: `0x${string}`,
  to: `0x${string}`,
  metadata: INFTMetadata
): Promise<MintResult> {
  if (!isChainWriteConfigured()) {
    throw new Error('INFT minting requires ZERO_G_CHAIN_PRIVATE_KEY');
  }

  const zgEnv = loadZeroGEnv();

  // 1. Upload metadata to 0G Storage
  const fullMetadata = { ...metadata, createdAt: Date.now() };
  const storageResult = await publishJson(fullMetadata);

  // 2. Compute metadata hash
  const metadataHash = sha256Hex(JSON.stringify(fullMetadata));

  // 3. Mint on-chain
  const chain = defineChain({
    id: zgEnv.chainId,
    name: '0G',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: { default: { http: [zgEnv.chainRpcUrl] } },
  });

  const account = privateKeyToAccount(zgEnv.chainPrivateKey as `0x${string}`);
  const walletClient = createWalletClient({ account, chain, transport: http(zgEnv.chainRpcUrl) });
  const publicClient = createPublicClient({ chain, transport: http(zgEnv.chainRpcUrl) });

  const txHash = await walletClient.writeContract({
    address: contractAddress,
    abi: INFT_ABI,
    functionName: 'mint',
    args: [to, storageResult.rootHash as `0x${string}`, metadataHash],
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  // Parse Transfer event for tokenId
  const transferLog = receipt.logs.find(
    (log) => log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
  );
  const tokenId = transferLog?.topics[3] ? String(BigInt(transferLog.topics[3])) : '0';

  return {
    tokenId,
    storageRoot: storageResult.rootHash,
    storageUri: storageResult.storageUri,
    metadataHash,
    txHash,
    owner: to,
  };
}

/**
 * Get INFT token info: owner + metadata from 0G Storage.
 */
export async function getINFTToken(
  contractAddress: `0x${string}`,
  tokenId: bigint
): Promise<{ owner: string; tokenURI: string }> {
  const zgEnv = loadZeroGEnv();
  const chain = defineChain({
    id: zgEnv.chainId,
    name: '0G',
    nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
    rpcUrls: { default: { http: [zgEnv.chainRpcUrl] } },
  });

  const client = createPublicClient({ chain, transport: http(zgEnv.chainRpcUrl) });

  const [owner, tokenURI] = await Promise.all([
    client.readContract({ address: contractAddress, abi: INFT_ABI, functionName: 'ownerOf', args: [tokenId] }),
    client.readContract({ address: contractAddress, abi: INFT_ABI, functionName: 'tokenURI', args: [tokenId] }).catch(() => ''),
  ]);

  return { owner: owner as string, tokenURI: tokenURI as string };
}
