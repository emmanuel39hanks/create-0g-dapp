import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scaffold } from '../src/scaffold';
import fse from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';
import type { CliOptions } from '../src/cli';

function makeOptions(overrides: Partial<CliOptions> = {}): CliOptions {
  return {
    projectName: 'e2e-test',
    template: 'minimal',
    network: 'mainnet',
    packageManager: 'npm',
    git: false,
    install: false,
    skills: [],
    ...overrides,
  };
}

describe('e2e scaffold with skills', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-0g-e2e-${Date.now()}`);
  });

  afterEach(async () => {
    await fse.remove(testDir);
  });

  it('scaffolds with prediction-market skill', async () => {
    await scaffold(makeOptions({ template: 'full-stack', skills: ['prediction-market'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/skills/prediction-engine.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/MarketCard.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/CreateMarket.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/markets/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/markets/resolve/route.ts'))).toBe(true);

    // Env vars appended
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('PREDICTION_ORACLE_MODEL');

    // Dependency added
    const pkg = await fse.readJson(join(testDir, 'package.json'));
    expect(pkg.dependencies.zod).toBeDefined();
  });

  it('scaffolds with agent-memory skill', async () => {
    await scaffold(makeOptions({ skills: ['agent-memory'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/skills/memory-store.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/memory/route.ts'))).toBe(true);
  });

  it('scaffolds with sealed-inference skill', async () => {
    await scaffold(makeOptions({ skills: ['sealed-inference'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/skills/sealed-client.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/inference/route.ts'))).toBe(true);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('ZERO_G_SEALED_INFERENCE_ENABLED');
  });

  it('scaffolds with multiple skills at once', async () => {
    await scaffold(makeOptions({
      template: 'full-stack',
      skills: ['prediction-market', 'agent-memory', 'nft-marketplace'],
    }), testDir);

    // prediction-market files
    expect(await fse.pathExists(join(testDir, 'lib/skills/prediction-engine.ts'))).toBe(true);
    // agent-memory files
    expect(await fse.pathExists(join(testDir, 'lib/skills/memory-store.ts'))).toBe(true);
    // nft-marketplace files
    expect(await fse.pathExists(join(testDir, 'app/components/skills/NFTGrid.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/MintForm.tsx'))).toBe(true);

    // All env vars present
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('PREDICTION_ORACLE_MODEL');
  });

  it('scaffolds with no skills (empty array)', async () => {
    await scaffold(makeOptions({ skills: [] }), testDir);
    // No skills dir created
    expect(await fse.pathExists(join(testDir, 'lib/skills'))).toBe(false);
    // Base lib still exists
    expect(await fse.pathExists(join(testDir, 'lib/0g/env.ts'))).toBe(true);
  });

  it('scaffolds with defi-yield-optimizer skill', async () => {
    await scaffold(makeOptions({ skills: ['defi-yield-optimizer'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/skills/yield-strategy.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/optimizer/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/YieldDashboard.tsx'))).toBe(true);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('YIELD_RISK_THRESHOLD');
  });

  it('scaffolds with agent-trading-bot skill', async () => {
    await scaffold(makeOptions({ skills: ['agent-trading-bot'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/skills/trading-engine.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/bot/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/TradingView.tsx'))).toBe(true);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('TRADING_MAX_POSITION');
    expect(env).toContain('TRADING_STRATEGY_MODEL');
  });

  it('scaffolds with social-fi skill', async () => {
    await scaffold(makeOptions({ skills: ['social-fi'] }), testDir);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/Feed.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/components/skills/PostComposer.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/skills/feed/route.ts'))).toBe(true);
  });

  it('ignores unknown skill names gracefully', async () => {
    await scaffold(makeOptions({ skills: ['nonexistent-skill'] }), testDir);
    // Should not crash, project still created
    expect(await fse.pathExists(join(testDir, 'package.json'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/env.ts'))).toBe(true);
  });
});

describe('e2e scaffold all templates', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-0g-tmpl-${Date.now()}`);
  });

  afterEach(async () => {
    await fse.remove(testDir);
  });

  const templates = ['minimal', 'full-stack', 'ai-agent', 'storage-dapp'] as const;

  for (const template of templates) {
    it(`${template} template produces valid package.json`, async () => {
      await scaffold(makeOptions({ template, skills: [] }), testDir);
      const pkg = await fse.readJson(join(testDir, 'package.json'));
      expect(pkg.name).toBe('e2e-test');
      expect(pkg.scripts.dev).toBeDefined();
      expect(pkg.scripts.build).toBeDefined();
      expect(pkg.dependencies.next).toBeDefined();
      expect(pkg.dependencies.react).toBeDefined();
    });

    it(`${template} template has valid tsconfig`, async () => {
      await scaffold(makeOptions({ template, skills: [] }), testDir);
      const tsconfig = await fse.readJson(join(testDir, 'tsconfig.json'));
      expect(tsconfig.compilerOptions).toBeDefined();
      expect(tsconfig.compilerOptions.target).toBe('ES2022');
      expect(tsconfig.compilerOptions.paths['@/*']).toBeDefined();
    });

    it(`${template} template has next.config.ts`, async () => {
      await scaffold(makeOptions({ template, skills: [] }), testDir);
      expect(await fse.pathExists(join(testDir, 'next.config.ts'))).toBe(true);
    });

    it(`${template} template has postcss.config`, async () => {
      await scaffold(makeOptions({ template, skills: [] }), testDir);
      expect(await fse.pathExists(join(testDir, 'postcss.config.mjs'))).toBe(true);
    });
  }

  it('full-stack template includes INFT page', async () => {
    await scaffold(makeOptions({ template: 'full-stack', skills: [] }), testDir);
    expect(await fse.pathExists(join(testDir, 'app/inft/page.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/inft/mint/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/inft/token/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/inft.ts'))).toBe(true);
  });

  it('full-stack includes brand assets', async () => {
    await scaffold(makeOptions({ template: 'full-stack', skills: [] }), testDir);
    expect(await fse.pathExists(join(testDir, 'public/0g-logo-purple.svg'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'public/0g-icon.png'))).toBe(true);
  });

  it('ai-agent template includes streaming chat with tools', async () => {
    await scaffold(makeOptions({ template: 'ai-agent', skills: [] }), testDir);
    const chatRoute = await fse.readFile(join(testDir, 'app/api/chat/route.ts'), 'utf-8');
    expect(chatRoute).toContain('tool_calls');
    expect(chatRoute).toContain('stream');
    expect(chatRoute).toContain('executeTool');
    const tools = await fse.readFile(join(testDir, 'lib/tools.ts'), 'utf-8');
    expect(tools).toContain('store_data');
    expect(tools).toContain('retrieve_data');
    expect(tools).toContain('anchor_proof');
    expect(tools).toContain('check_health');
  });
});

describe('e2e network configuration', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-0g-net-${Date.now()}`);
  });

  afterEach(async () => {
    await fse.remove(testDir);
  });

  it('mainnet env has correct RPCs and chain ID', async () => {
    await scaffold(makeOptions({ network: 'mainnet', skills: [] }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('ZERO_G_CHAIN_ID=16661');
    expect(env).toContain('https://evmrpc.0g.ai');
    expect(env).toContain('https://indexer-storage-turbo.0g.ai');
    expect(env).toContain('https://chainscan.0g.ai');
    expect(env).toContain('https://storagescan.0g.ai');
    expect(env).toContain('NEXT_PUBLIC_0G_NETWORK=mainnet');
  });

  it('testnet env has correct RPCs and chain ID', async () => {
    await scaffold(makeOptions({ network: 'testnet', skills: [] }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('ZERO_G_CHAIN_ID=16600');
    expect(env).toContain('https://evmrpc-testnet.0g.ai');
    expect(env).toContain('testnet');
    expect(env).toContain('NEXT_PUBLIC_0G_NETWORK=testnet');
  });

  it('env.example has no real secrets', async () => {
    await scaffold(makeOptions({ skills: [] }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).not.toMatch(/0x[a-f0-9]{64}/i);
    expect(env).not.toContain('app-sk-');
    expect(env).not.toContain('sk-proj-');
    // Private key field should be empty
    const lines = env.split('\n');
    const pkLine = lines.find(l => l.startsWith('ZERO_G_CHAIN_PRIVATE_KEY='));
    expect(pkLine).toBe('ZERO_G_CHAIN_PRIVATE_KEY=');
  });

  it('env.example has explanatory comments', async () => {
    await scaffold(makeOptions({ skills: [] }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    const commentLines = env.split('\n').filter(l => l.startsWith('#'));
    expect(commentLines.length).toBeGreaterThan(10);
    expect(env).toContain('Generate:'); // has generation instructions
  });
});

describe('e2e security', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-0g-sec-${Date.now()}`);
  });

  afterEach(async () => {
    await fse.remove(testDir);
  });

  it('.gitignore blocks sensitive files', async () => {
    await scaffold(makeOptions({ skills: [] }), testDir);
    const gitignore = await fse.readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('.env');
    expect(gitignore).toContain('.env.local');
    expect(gitignore).toContain('node_modules');
  });

  it('no skill file contains hardcoded secrets', async () => {
    await scaffold(makeOptions({
      template: 'full-stack',
      skills: ['prediction-market', 'agent-memory', 'sealed-inference'],
    }), testDir);

    const allFiles = await getAllFiles(testDir);
    for (const file of allFiles) {
      if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
      const content = await fse.readFile(file, 'utf-8');
      // Check for private keys (64 hex chars) but allow known constants like ERC event topics
      const hexMatches = content.match(/0x[a-f0-9]{64}/gi) || [];
      const KNOWN_CONSTANTS = [
        '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // ERC-721 Transfer topic
      ];
      const suspicious = hexMatches.filter(m => !KNOWN_CONSTANTS.includes(m.toLowerCase()));
      expect(suspicious, `${file} has suspicious hex: ${suspicious.join(', ')}`).toHaveLength(0);
      expect(content, file).not.toContain('app-sk-'); // no API keys
      expect(content, file).not.toContain('sk-proj-'); // no OpenAI keys
    }
  });
});

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fse.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'public') continue;
      files.push(...await getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}
