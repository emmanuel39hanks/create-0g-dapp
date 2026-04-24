# 0G App — Setup Guide

## Quick Start

```bash
# 1. Copy env file
cp .env.example .env.local

# 2. Fill in your private key (minimum required for Storage + Chain)
#    Generate one: node -e "console.log('0x'+require('crypto').randomBytes(32).toString('hex'))"

# 3. Fund your wallet with 0G tokens
#    Mainnet: buy 0G on exchanges
#    Testnet: get from faucet (ask in https://t.me/zgcommunity)

# 4. Start dev server
npm run dev

# 5. Check health
open http://localhost:3000/api/0g/health
```

## 0G Components

| Component | What it does | Required env vars |
|-----------|-------------|-------------------|
| **Storage** | Upload/download immutable data (receipts, profiles, files) | `ZERO_G_STORAGE_INDEXER_URL`, `ZERO_G_CHAIN_PRIVATE_KEY` |
| **Chain** | Anchor data hashes on-chain for proof | `ZERO_G_CHAIN_PRIVATE_KEY`, `ZERO_G_CHAIN_RPC_URL` |
| **Compute** | AI inference via Qwen/GLM/DeepSeek on decentralized GPUs | `ZERO_G_COMPUTE_BASE_URL`, `ZERO_G_COMPUTE_API_KEY`, `ZERO_G_COMPUTE_MODEL` |
| **KV** | Mutable key-value store (for live/updateable data) | `ZERO_G_STORAGE_STREAM_ID` + Storage vars |
| **DA** | Real-time event streaming via data availability layer | `ZERO_G_DA_GRPC_URL` (requires local sidecar) |

## Setting up Compute (AI Inference)

```bash
# Install the CLI
npm install -g @0glabs/0g-serving-broker

# Setup network (first time only)
0g-compute-cli setup-network
# Choose mainnet or testnet, enter your private key

# Login
0g-compute-cli login

# Deposit 0G tokens for inference
0g-compute-cli deposit --amount 5

# List available models
0g-compute-cli inference list-providers

# Get your API key for a specific model
0g-compute-cli inference get-secret --provider <PROVIDER_ADDRESS>
# This gives you app-sk-... — put it in ZERO_G_COMPUTE_API_KEY
```

### Available Models (Mainnet)

| Model | Provider | Use case |
|-------|----------|----------|
| `qwen3.6-plus` | Alibaba/0G | Best for agents, 1M context |
| `qwen/qwen3-vl-30b-a3b-instruct` | 0G | Vision + language |
| `zai-org/GLM-5-FP8` | 0G | 744B params, open source |
| `deepseek/deepseek-chat-v3-0324` | 0G | Reasoning tasks |

## Common Issues

### "Chain mismatch" error
Your `ZERO_G_CHAIN_ID` doesn't match the RPC endpoint.
- Mainnet: `ZERO_G_CHAIN_ID=16661` + `ZERO_G_CHAIN_RPC_URL=https://evmrpc.0g.ai`
- Testnet: `ZERO_G_CHAIN_ID=16600` + `ZERO_G_CHAIN_RPC_URL=https://evmrpc-testnet.0g.ai`

### "Storage write requires ZERO_G_CHAIN_PRIVATE_KEY"
You need a funded wallet to upload to 0G Storage. Generate a key and fund it with 0G tokens.

### "listService() fails"
The Compute broker auto-detects the InferencingCA contract from chain ID. If your wallet is on a different network than your RPC, it picks the wrong contract. Make sure everything is on the same network.

### "Provider proxy: model not supported"
The model name has a typo or trailing whitespace. Copy the exact model name from `0g-compute-cli inference list-providers`.

## Links

- [0G Docs](https://docs.0g.ai)
- [0G Explorer](https://chainscan.0g.ai)
- [0G Storage Explorer](https://storagescan.0g.ai)
- [0G Compute Marketplace](https://compute-marketplace.0g.ai)
- [0G Community](https://t.me/zgcommunity)
