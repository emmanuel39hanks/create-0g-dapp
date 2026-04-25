# create-0g-dapp

One command to start building on [0G](https://0g.ai) — the decentralized AI network.

```bash
npx create-0g-dapp my-app
```

You get a working Next.js app with 0G Storage, Chain, Compute, and INFT already wired up. Pick a template, pick a network, add skills — start building.

---

## Why this exists

Building on 0G means configuring 20+ env vars, two different SDKs, and figuring out which chain ID goes with which RPC. If you get the chain ID wrong, nothing tells you — it just silently fails.

This tool does the setup for you. Every template comes with health checks that tell you exactly what's missing, network mismatch protection that catches the #1 bug, and env files with comments explaining every variable.

## Quick Start

```bash
npx create-0g-dapp my-app
cd my-app
cp .env.example .env.local
# Add your private key (see below)
npm run dev
# Open http://localhost:3000/api/0g/health
```

### Get a private key

```bash
node -e "console.log('0x'+require('crypto').randomBytes(32).toString('hex'))"
```

Fund it with 0G tokens — [buy on exchanges](https://www.coingecko.com/en/coins/0g) (mainnet) or ask in [Telegram](https://t.me/zgcommunity) (testnet).

## Templates

You pick one during setup:

| Template | What you get |
|----------|-------------|
| **Full Stack** | Dashboard + demo pages for Storage, Compute, Chain, INFT |
| **AI Agent** | Chat UI with tool calling — the AI can store data, anchor proofs, query models |
| **Storage dApp** | Upload/download files + anchor hashes on-chain |
| **Minimal** | Just the SDK helpers and health check — build from scratch |

## Skills

Skills are add-ons you install during setup or later. Each one adds components, API routes, and lib helpers for a specific use case.

```bash
# During init — interactive picker
npx create-0g-dapp my-app

# Or specify directly
npx create-0g-dapp my-app --skills prediction-market,agent-memory

# Add to an existing project
npx create-0g-dapp add prediction-market

# List all available skills
npx create-0g-dapp list
```

### Available skills

| Skill | Track | What it does |
|-------|-------|-------------|
| `prediction-market` | Agentic Economy | AI oracle resolves markets, proofs stored on 0G |
| `defi-yield-optimizer` | Verifiable Finance | AI analyzes yields, decisions logged to 0G Storage |
| `agent-trading-bot` | Verifiable Finance | Autonomous trading with verifiable execution |
| `nft-marketplace` | Web 4.0 | Mint INFTs with metadata on 0G Storage |
| `social-fi` | Web 4.0 | Decentralized social feed, posts on 0G |
| `agent-memory` | Agentic Infrastructure | Persistent agent memory across sessions |
| `sealed-inference` | Privacy | TEE-backed private AI — tamper-proof responses |

## What's inside every project

```
my-app/
├── app/
│   ├── page.tsx              # Main page (template-specific)
│   └── api/0g/health/        # Health check — shows what's configured
├── lib/0g/
│   ├── env.ts                # Loads + validates all env vars
│   ├── config.ts             # Network resolver (mainnet vs testnet)
│   ├── storage.ts            # publishJson(), downloadJson()
│   ├── chain.ts              # anchorHash(), getChainHealth()
│   ├── compute.ts            # chat(), infer(), listServices()
│   ├── inft.ts               # mintINFT(), getINFTToken()
│   └── health.ts             # Aggregated health check
├── .env.example              # Every variable explained
├── AGENT.md                  # Setup guide + troubleshooting
└── public/
    └── 0g-logo-purple.svg    # Brand assets included
```

## CLI flags

Skip the prompts for CI or scripting:

```bash
npx create-0g-dapp my-app \
  --template ai-agent \
  --network mainnet \
  --skills prediction-market,agent-memory \
  --pm pnpm \
  --no-git \
  --no-install
```

## 0G components

| Component | What it does | How you use it |
|-----------|-------------|---------------|
| **Storage** | Store data permanently — files, receipts, metadata | `publishJson(data)` → get a root hash back |
| **Chain** | Write proof on-chain — "this data existed at this time" | `anchorHash(hash)` → get a tx hash back |
| **Compute** | Run AI models (Qwen, GLM-5, DeepSeek) on decentralized GPUs | `chat("hello")` → get a response, no OpenAI needed |
| **INFT** | Mint NFTs with metadata stored on 0G, verified on-chain | `mintINFT(contract, to, metadata)` |

### Why decentralized AI matters

Imagine if all Bitcoin mining ran on one server in one data center owned by one company. If that server goes down, Bitcoin stops. If that company decides to change the rules, everyone is stuck. That's how centralized AI works today — one company (OpenAI, Google) controls the models, the data, the access, and the kill switch.

0G is the mining pool for AI. Many providers run models on their own GPUs. No single point of failure. No single company deciding who gets access. And TEE (hardware enclaves) cryptographically prove the AI actually ran the computation correctly — like proof of work, but for intelligence.

### Available models on 0G Compute

| Model | What it's good at |
|-------|-------------------|
| `qwen3.6-plus` | Best overall — 1M context, agentic tasks, Alibaba's latest |
| `qwen/qwen3-vl-30b` | Vision + language |
| `zai-org/GLM-5-FP8` | 744B params, largest open model |
| `deepseek/deepseek-chat-v3` | Reasoning and code |
| `openai/whisper-large-v3` | Speech-to-text |

Browse live: [0G Compute Marketplace](https://compute-marketplace.0g.ai)

## Networks

| | Mainnet | Testnet |
|---|---|---|
| Chain ID | 16661 | 16600 |
| RPC | `https://evmrpc.0g.ai` | `https://evmrpc-testnet.0g.ai` |
| Explorer | [chainscan.0g.ai](https://chainscan.0g.ai) | [chainscan-testnet.0g.ai](https://chainscan-testnet.0g.ai) |
| Storage | [storagescan.0g.ai](https://storagescan.0g.ai) | [storagescan-testnet.0g.ai](https://storagescan-testnet.0g.ai) |

## Common issues

**"Chain mismatch"** — Your chain ID doesn't match your RPC. The health endpoint catches this automatically with a clear error message.

**"listService() fails"** — The 0G Compute broker picks the wrong contract when your wallet is on a different network than your RPC. Make sure everything is on the same network.

**"Module not found: @0glabs/0g-serving-broker"** — Run `npm install`. All templates include the right dependencies.

## 0G resources

- [Documentation](https://docs.0g.ai)
- [Compute Marketplace](https://compute-marketplace.0g.ai)
- [Chain Explorer](https://chainscan.0g.ai)
- [Storage Explorer](https://storagescan.0g.ai)
- [Builder Hub](https://build.0g.ai)
- [SDKs](https://build.0g.ai/sdks)
- [Showcase](https://build.0g.ai/showcase)
- [Brand Kit](https://0g.ai/brandkit)
- [Community (Telegram)](https://t.me/zgcommunity)

## Contributing

PRs welcome. To add a skill:

1. Create `skills/<name>/` with your components, API routes, and lib files
2. Add it to `SKILLS` in `src/skills.ts`
3. Run `pnpm test` — all 70 tests should pass
4. Open a PR

## License

[MIT](LICENSE)
