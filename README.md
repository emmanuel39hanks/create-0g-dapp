# create-0g-app

Scaffold a Next.js app with the [0G](https://0g.ai) decentralized AI network. Storage, Chain, Compute, KV, DA — wired up and ready in one command.

```bash
npx create-0g-app my-app
```

## Templates

| Template | What you get |
|----------|-------------|
| **Full Stack** | All 5 components with demo pages for Storage, Compute, Chain |
| **AI Agent** | Chat interface with tool calling — agents that think (0G Compute) and remember (0G Storage) |
| **Storage dApp** | Upload/download files + anchor hashes on-chain |
| **Minimal** | SDK helpers only — bring your own logic |

## What's included

Every template ships with:

- `lib/0g/` — TypeScript helpers for Storage, Chain, Compute, KV, DA
- `/api/0g/health` — Health check endpoint for all components
- `.env.example` — All 20+ env vars with comments
- `AGENT.md` — Setup guide with common pitfalls and solutions
- Network auto-detection with chain mismatch protection
- Graceful degradation when components aren't configured

## CLI Options

```bash
npx create-0g-app my-app \
  --template ai-agent \    # full-stack | ai-agent | storage-dapp | minimal
  --network mainnet \      # mainnet | testnet
  --pm pnpm \              # npm | pnpm | yarn | bun
  --no-git \               # skip git init
  --no-install             # skip dependency installation
```

## Quick Start

```bash
npx create-0g-app my-app
cd my-app
cp .env.example .env.local
# Fill in your ZERO_G_CHAIN_PRIVATE_KEY
npm run dev
# Open http://localhost:3000/api/0g/health
```

## 0G Components

| Component | What it does | SDK |
|-----------|-------------|-----|
| **Storage** | Immutable data (receipts, files, profiles) | `@0gfoundation/0g-ts-sdk` |
| **Chain** | Anchor hashes on-chain for proof | `viem` |
| **Compute** | AI inference (Qwen, GLM-5, DeepSeek) | `openai` (compatible API) |
| **KV** | Mutable key-value store | `@0gfoundation/0g-ts-sdk` |
| **DA** | Real-time event streaming | gRPC sidecar |

## Links

- [0G Documentation](https://docs.0g.ai)
- [0G Compute Marketplace](https://compute-marketplace.0g.ai)
- [0G Explorer](https://chainscan.0g.ai)
- [0G Storage Explorer](https://storagescan.0g.ai)

## License

MIT
