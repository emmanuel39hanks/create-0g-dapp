# Setup Guide

Built with **Next.js 16** — Turbopack is default, `proxy.ts` replaces `middleware.ts`.

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

Turbopack is the default bundler in Next.js 16 — no `--turbopack` flag needed.

## 3. Check health

Open `http://localhost:3000/api/0g/health`

It shows you exactly what's working and what's missing.

## Next.js 16 notes

This project uses Next.js 16 standards:

- **Turbopack is default** — no `--turbopack` flag in scripts
- **`proxy.ts` replaces `middleware.ts`** — if you need request interception, create `proxy.ts` at the root (not `middleware.ts`). Export a `proxy()` function, not `middleware()`. Runs on Node.js runtime (not edge).
- **Async request APIs** — `cookies()`, `headers()`, `params`, `searchParams` are all async. Always `await` them.
- **`next lint` removed** — use ESLint directly or Biome
- **React 19.2** — includes View Transitions, `useEffectEvent`, Activity API

```ts
// proxy.ts (Next.js 16) — replaces middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  // Your logic here
  return NextResponse.next();
}
```

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

**Turbopack root error:** Already handled — `next.config.ts` sets `turbopack.root` automatically.

## Links

- [0G Docs](https://docs.0g.ai)
- [Compute Marketplace](https://compute-marketplace.0g.ai)
- [Chain Explorer](https://chainscan.0g.ai)
- [Storage Explorer](https://storagescan.0g.ai)
- [Community](https://t.me/zgcommunity)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
