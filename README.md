# create-0g-app

Scaffold a [Next.js](https://nextjs.org) app with the [0G](https://0g.ai) decentralized AI network. Storage, Chain, Compute, KV, DA — wired up and ready in one command.

```bash
npx create-0g-app my-app
```

Built to reduce onboarding friction for [0G Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon) builders and anyone building on the 0G network.

---

## Templates

| Template | What you get |
|----------|-------------|
| **Full Stack** | All 5 components with demo pages for Storage, Compute, and Chain |
| **AI Agent** | Chat interface with tool calling — agents that think (0G Compute) and remember (0G Storage) |
| **Storage dApp** | Upload/download files + anchor data hashes on 0G Chain |
| **Minimal** | SDK helpers and health check — bring your own logic |

## What's included

Every generated project ships with:

- **`lib/0g/`** — TypeScript helpers for [Storage](https://docs.0g.ai/developer-hub/building-on-0g/storage), [Chain](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g), [Compute](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference), KV, and DA
- **`/api/0g/health`** — Health check endpoint that shows the status of all configured components
- **`.env.example`** — All 20+ environment variables with inline comments explaining each one
- **`AGENT.md`** — Setup guide covering common issues (chain mismatch, missing keys, provider errors)
- **Chain mismatch protection** — auto-detects when your RPC and chain ID don't match
- **Graceful degradation** — unconfigured components show as "disabled", not errors

## Quick Start

```bash
# 1. Scaffold
npx create-0g-app my-app

# 2. Configure
cd my-app
cp .env.example .env.local
# Fill in ZERO_G_CHAIN_PRIVATE_KEY (minimum required)

# 3. Run
npm run dev

# 4. Verify
open http://localhost:3000/api/0g/health
```

### Generate a private key

```bash
node -e "console.log('0x'+require('crypto').randomBytes(32).toString('hex'))"
```

Fund the wallet with 0G tokens:
- **Mainnet:** Buy 0G on [exchanges](https://www.coingecko.com/en/coins/0g)
- **Testnet:** Ask in the [0G Community Telegram](https://t.me/zgcommunity)

## CLI Options

```bash
npx create-0g-app my-app \
  --template ai-agent \    # full-stack | ai-agent | storage-dapp | minimal
  --network mainnet \      # mainnet | testnet
  --pm pnpm \              # npm | pnpm | yarn | bun
  --no-git \               # skip git init
  --no-install             # skip dependency installation
```

All options can also be selected interactively when you run without flags.

## 0G Components

| Component | What it does | SDK | Docs |
|-----------|-------------|-----|------|
| **Storage** | Immutable data upload/download (log layer) | [`@0gfoundation/0g-ts-sdk`](https://www.npmjs.com/package/@0gfoundation/0g-ts-sdk) | [Storage Docs](https://docs.0g.ai/developer-hub/building-on-0g/storage) |
| **Chain** | Anchor data hashes on-chain for verifiable proof | [`viem`](https://viem.sh) | [Chain Docs](https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g) |
| **Compute** | AI inference — Qwen, GLM-5, DeepSeek on decentralized GPUs | [`openai`](https://www.npmjs.com/package/openai) (compatible API) | [Compute Docs](https://docs.0g.ai/developer-hub/building-on-0g/compute-network/inference) |
| **KV** | Mutable key-value store (for updateable data) | [`@0gfoundation/0g-ts-sdk`](https://www.npmjs.com/package/@0gfoundation/0g-ts-sdk) | [Storage Docs](https://docs.0g.ai/developer-hub/building-on-0g/storage) |
| **DA** | Real-time event streaming via data availability layer | gRPC sidecar | [DA Docs](https://docs.0g.ai/developer-hub/building-on-0g/storage) |

### Available AI Models on 0G Compute

| Model | Type | Provider |
|-------|------|----------|
| `qwen3.6-plus` | Chat (1M context, Alibaba's latest) | [Alibaba Cloud x 0G](https://0g.ai/blog) |
| `qwen/qwen3-vl-30b-a3b-instruct` | Vision + Language | 0G |
| `zai-org/GLM-5-FP8` | Chat (744B params, open source) | 0G |
| `deepseek/deepseek-chat-v3-0324` | Chat + Reasoning | 0G |
| `openai/whisper-large-v3` | Speech-to-Text | 0G |

Browse live: [0G Compute Marketplace](https://compute-marketplace.0g.ai)

### Setting up Compute

```bash
npm install -g @0glabs/0g-serving-broker
0g-compute-cli setup-network         # choose mainnet/testnet
0g-compute-cli login                  # enter private key
0g-compute-cli deposit --amount 5     # fund your account
0g-compute-cli inference list-providers                    # see models
0g-compute-cli inference get-secret --provider <ADDR>      # get API key
```

Put the API key (`app-sk-...`) in `ZERO_G_COMPUTE_API_KEY` in your `.env.local`.

## Network Configuration

| | Mainnet | Testnet |
|---|---|---|
| **Chain ID** | 16661 | 16600 |
| **RPC** | `https://evmrpc.0g.ai` | `https://evmrpc-testnet.0g.ai` |
| **Explorer** | [chainscan.0g.ai](https://chainscan.0g.ai) | [chainscan-testnet.0g.ai](https://chainscan-testnet.0g.ai) |
| **Storage** | [storagescan.0g.ai](https://storagescan.0g.ai) | [storagescan-testnet.0g.ai](https://storagescan-testnet.0g.ai) |
| **Storage Indexer** | `https://indexer-storage-turbo.0g.ai` | `https://indexer-storage-turbo-testnet.0g.ai` |
| **Flow Contract** | `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` | `0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526` |
| **InferencingCA** | `0x47340d900bdFec2BD393c626E12ea0656F938d84` | `0xa79F4c8311FF93C06b8CfB403690cc987c93F91E` |

## Common Issues

### Chain mismatch error
Your `ZERO_G_CHAIN_ID` doesn't match the RPC. The health endpoint will catch this:
```
Error: 0G network mismatch — configured ZERO_G_CHAIN_ID=16600 (testnet)
but RPC at https://evmrpc.0g.ai returned chainId=16661 (mainnet).
```
Fix: make sure both point to the same network.

### listService() fails
The 0G Compute broker auto-detects the InferencingCA contract from chain ID. If your wallet is on a different chain than your RPC, it picks the wrong contract. Ensure everything is on the same network.

### Model not supported
The model name has a typo or trailing whitespace. Copy the exact name from `0g-compute-cli inference list-providers`.

### Storage write requires private key
You need a funded 0G wallet to upload. Generate a key, fund it, set `ZERO_G_CHAIN_PRIVATE_KEY`.

## Hackathon Tracks

This tool is designed to help builders across all [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon) tracks:

- **Track 1 (Agentic Infrastructure)** — Use the `ai-agent` template for agent frameworks with 0G Compute + Storage
- **Track 2 (Verifiable Finance)** — Use `full-stack` for trading bots with verifiable execution via 0G Chain
- **Track 3 (Agentic Economy)** — Use `full-stack` or `ai-agent` for commerce platforms with 0G proof trails
- **Track 4 (Web 4.0)** — Use `storage-dapp` for high-performance apps with decentralized storage
- **Track 5 (Privacy Infrastructure)** — Use `full-stack` with Sealed Inference (TEE) for privacy-preserving AI

## 0G Resources

- [0G Documentation](https://docs.0g.ai) — Full developer hub
- [0G Compute Marketplace](https://compute-marketplace.0g.ai) — Browse and use AI models
- [0G Chain Explorer](https://chainscan.0g.ai) — Block explorer
- [0G Storage Explorer](https://storagescan.0g.ai) — View stored data
- [0G SDKs & Starter Kits](https://build.0g.ai/sdks) — Official SDKs
- [0G Builder Hub](https://build.0g.ai) — Developer portal
- [0G Showcase](https://build.0g.ai/showcase) — Projects built on 0G
- [0G Community (Telegram)](https://t.me/zgcommunity) — Get help, request testnet tokens
- [0G on X](https://x.com/0G_labs) — Latest announcements

## Contributing

PRs welcome. To add a new template:

1. Create a directory in `templates/`
2. Add template-specific files (they overlay on top of `templates/base/`)
3. Add deps to `TEMPLATE_DEPS` in `src/constants.ts`
4. Add tests in `tests/scaffold.test.ts`
5. Run `pnpm test` to verify

## License

[MIT](LICENSE)
