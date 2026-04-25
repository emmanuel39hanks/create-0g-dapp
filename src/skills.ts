/**
 * Skills Registry
 *
 * Skills are add-on modules users can install into their 0G project.
 * Each skill adds components, API routes, and lib files for a specific use case.
 */

export interface SkillFile {
  source: string;   // Path relative to skills/<name>/
  target: string;   // Path relative to project root
}

export interface Skill {
  name: string;
  description: string;
  track: string;     // Hackathon track
  category: 'agentic' | 'defi' | 'economy' | 'web4' | 'privacy' | 'infrastructure';
  dependencies: Record<string, string>;
  envVars?: Record<string, string>;
  files: SkillFile[];
}

export const SKILLS: Record<string, Skill> = {
  'prediction-market': {
    name: 'prediction-market',
    description: 'AI-powered prediction markets — 0G Compute resolves outcomes, Storage stores proofs',
    track: 'Track 3: Agentic Economy',
    category: 'economy',
    dependencies: { zod: '^3.24.0' },
    envVars: { PREDICTION_ORACLE_MODEL: 'qwen3.6-plus' },
    files: [
      { source: 'components/MarketCard.tsx', target: 'app/components/skills/MarketCard.tsx' },
      { source: 'components/CreateMarket.tsx', target: 'app/components/skills/CreateMarket.tsx' },
      { source: 'api/markets/route.ts', target: 'app/api/skills/markets/route.ts' },
      { source: 'api/markets/resolve/route.ts', target: 'app/api/skills/markets/resolve/route.ts' },
      { source: 'lib/prediction-engine.ts', target: 'lib/skills/prediction-engine.ts' },
    ],
  },

  'defi-yield-optimizer': {
    name: 'defi-yield-optimizer',
    description: 'AI agent that finds and executes yield strategies — verified via Sealed Inference',
    track: 'Track 2: Verifiable Finance',
    category: 'defi',
    dependencies: {},
    envVars: { YIELD_RISK_THRESHOLD: '0.7' },
    files: [
      { source: 'components/YieldDashboard.tsx', target: 'app/components/skills/YieldDashboard.tsx' },
      { source: 'api/optimizer/route.ts', target: 'app/api/skills/optimizer/route.ts' },
      { source: 'lib/yield-strategy.ts', target: 'lib/skills/yield-strategy.ts' },
    ],
  },

  'agent-trading-bot': {
    name: 'agent-trading-bot',
    description: 'Autonomous trading agent with verifiable execution on 0G Chain',
    track: 'Track 2: Verifiable Finance',
    category: 'defi',
    dependencies: {},
    envVars: { TRADING_MAX_POSITION: '100', TRADING_STRATEGY_MODEL: 'qwen3.6-plus' },
    files: [
      { source: 'components/TradingView.tsx', target: 'app/components/skills/TradingView.tsx' },
      { source: 'api/bot/route.ts', target: 'app/api/skills/bot/route.ts' },
      { source: 'lib/trading-engine.ts', target: 'lib/skills/trading-engine.ts' },
    ],
  },

  'nft-marketplace': {
    name: 'nft-marketplace',
    description: 'INFT marketplace — mint, browse, and trade NFTs with metadata on 0G Storage',
    track: 'Track 4: Web 4.0',
    category: 'web4',
    dependencies: {},
    files: [
      { source: 'components/NFTGrid.tsx', target: 'app/components/skills/NFTGrid.tsx' },
      { source: 'components/MintForm.tsx', target: 'app/components/skills/MintForm.tsx' },
      { source: 'api/nft/route.ts', target: 'app/api/skills/nft/route.ts' },
    ],
  },

  'social-fi': {
    name: 'social-fi',
    description: 'Decentralized social feed — posts stored on 0G Storage, indexed on-chain',
    track: 'Track 4: Web 4.0',
    category: 'web4',
    dependencies: {},
    files: [
      { source: 'components/Feed.tsx', target: 'app/components/skills/Feed.tsx' },
      { source: 'components/PostComposer.tsx', target: 'app/components/skills/PostComposer.tsx' },
      { source: 'api/feed/route.ts', target: 'app/api/skills/feed/route.ts' },
    ],
  },

  'agent-memory': {
    name: 'agent-memory',
    description: 'Persistent agent memory on 0G Storage — agents remember across sessions',
    track: 'Track 1: Agentic Infrastructure',
    category: 'agentic',
    dependencies: {},
    files: [
      { source: 'lib/memory-store.ts', target: 'lib/skills/memory-store.ts' },
      { source: 'api/memory/route.ts', target: 'app/api/skills/memory/route.ts' },
    ],
  },

  'sealed-inference': {
    name: 'sealed-inference',
    description: 'TEE-backed private AI inference — tamper-proof responses with attestation',
    track: 'Track 5: Privacy',
    category: 'privacy',
    dependencies: {},
    envVars: { ZERO_G_SEALED_INFERENCE_ENABLED: 'true' },
    files: [
      { source: 'lib/sealed-client.ts', target: 'lib/skills/sealed-client.ts' },
      { source: 'api/inference/route.ts', target: 'app/api/skills/inference/route.ts' },
    ],
  },
};

export function getSkillsByTrack(): Record<string, Skill[]> {
  const tracks: Record<string, Skill[]> = {};
  for (const skill of Object.values(SKILLS)) {
    if (!tracks[skill.track]) tracks[skill.track] = [];
    tracks[skill.track].push(skill);
  }
  return tracks;
}

export function listSkills(): Array<{ value: string; label: string; hint: string }> {
  return Object.values(SKILLS).map((s) => ({
    value: s.name,
    label: s.name,
    hint: `${s.track} — ${s.description}`,
  }));
}
