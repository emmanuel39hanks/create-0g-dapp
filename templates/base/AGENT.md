# Setup Guide

## 1. Configure

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```bash
# Required — your wallet key for Storage uploads and Chain anchoring
ZERO_G_CHAIN_PRIVATE_KEY=0x...

# Optional — enable AI inference
ZERO_G_COMPUTE_ENABLED=true
ZERO_G_COMPUTE_BASE_URL=https://compute-network-18.integratenetwork.work
ZERO_G_COMPUTE_API_KEY=app-sk-...
ZERO_G_COMPUTE_MODEL=qwen3.6-plus
```

Generate a key: `node -e "console.log('0x'+require('crypto').randomBytes(32).toString('hex'))"`

Fund it with 0G tokens.

## 2. Run

```bash
npm run dev
```

## 3. Check health

Open `http://localhost:3000/api/0g/health`

It shows you exactly what's working and what's missing.

## Getting Compute credentials

```bash
npm install -g @0glabs/0g-serving-broker
0g-compute-cli setup-network    # pick mainnet/testnet
0g-compute-cli login             # enter private key
0g-compute-cli deposit --amount 5
0g-compute-cli inference list-providers
0g-compute-cli inference get-secret --provider <ADDRESS>
```

The `app-sk-...` key goes in `ZERO_G_COMPUTE_API_KEY`.

## Available models

| Model | Best for |
|-------|---------|
| `qwen3.6-plus` | General purpose, agents, 1M context |
| `qwen/qwen3-vl-30b` | Vision + language |
| `zai-org/GLM-5-FP8` | 744B params, largest open model |
| `deepseek/deepseek-chat-v3` | Reasoning |

## Common problems

**Chain mismatch:** Your chain ID and RPC are on different networks. Mainnet = 16661 + `evmrpc.0g.ai`. Testnet = 16600 + `evmrpc-testnet.0g.ai`.

**listService() returns nothing:** Chain mismatch (see above).

**"model not supported":** Model name has a typo. Copy the exact name from `0g-compute-cli inference list-providers`.

**Storage upload fails:** You need `ZERO_G_CHAIN_PRIVATE_KEY` set and funded with 0G tokens.

## Links

- [0G Docs](https://docs.0g.ai)
- [Compute Marketplace](https://compute-marketplace.0g.ai)
- [Chain Explorer](https://chainscan.0g.ai)
- [Storage Explorer](https://storagescan.0g.ai)
- [Community](https://t.me/zgcommunity)
