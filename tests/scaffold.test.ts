import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scaffold } from '../src/scaffold';
import fse from 'fs-extra';
import { join } from 'path';
import { tmpdir } from 'os';
import type { CliOptions } from '../src/cli';

function makeOptions(overrides: Partial<CliOptions> = {}): CliOptions {
  return {
    projectName: 'test-project',
    template: 'minimal',
    network: 'mainnet',
    packageManager: 'npm',
    git: false,
    install: false,
    ...overrides,
  };
}

describe('scaffold', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = join(tmpdir(), `create-0g-app-test-${Date.now()}`);
  });

  afterEach(async () => {
    await fse.remove(testDir);
  });

  it('creates project directory', async () => {
    await scaffold(makeOptions(), testDir);
    expect(await fse.pathExists(testDir)).toBe(true);
  });

  it('generates package.json with correct name', async () => {
    await scaffold(makeOptions({ projectName: 'my-cool-app' }), testDir);
    const pkg = await fse.readJson(join(testDir, 'package.json'));
    expect(pkg.name).toBe('my-cool-app');
  });

  it('generates .env.example with correct chain id for mainnet', async () => {
    await scaffold(makeOptions({ network: 'mainnet' }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('ZERO_G_CHAIN_ID=16661');
    expect(env).toContain('evmrpc.0g.ai');
  });

  it('generates .env.example with correct chain id for testnet', async () => {
    await scaffold(makeOptions({ network: 'testnet' }), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).toContain('ZERO_G_CHAIN_ID=16600');
    expect(env).toContain('testnet');
  });

  it('includes 0G lib helpers', async () => {
    await scaffold(makeOptions(), testDir);
    expect(await fse.pathExists(join(testDir, 'lib/0g/env.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/storage.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/chain.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/compute.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/0g/health.ts'))).toBe(true);
  });

  it('includes health endpoint', async () => {
    await scaffold(makeOptions(), testDir);
    expect(await fse.pathExists(join(testDir, 'app/api/0g/health/route.ts'))).toBe(true);
  });

  it('includes AGENT.md', async () => {
    await scaffold(makeOptions(), testDir);
    expect(await fse.pathExists(join(testDir, 'AGENT.md'))).toBe(true);
  });

  it('includes .gitignore', async () => {
    await scaffold(makeOptions(), testDir);
    const gitignore = await fse.readFile(join(testDir, '.gitignore'), 'utf-8');
    expect(gitignore).toContain('node_modules');
    expect(gitignore).toContain('.env.local');
  });

  it('full-stack template includes demo pages', async () => {
    await scaffold(makeOptions({ template: 'full-stack' }), testDir);
    expect(await fse.pathExists(join(testDir, 'app/storage/page.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/compute/page.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/chain/page.tsx'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/storage/route.ts'))).toBe(true);
  });

  it('ai-agent template includes chat route and tools', async () => {
    await scaffold(makeOptions({ template: 'ai-agent' }), testDir);
    expect(await fse.pathExists(join(testDir, 'app/api/chat/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/tools.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'lib/tool-executor.ts'))).toBe(true);
  });

  it('storage-dapp template includes upload and anchor routes', async () => {
    await scaffold(makeOptions({ template: 'storage-dapp' }), testDir);
    expect(await fse.pathExists(join(testDir, 'app/api/upload/route.ts'))).toBe(true);
    expect(await fse.pathExists(join(testDir, 'app/api/anchor/route.ts'))).toBe(true);
  });

  it('does not include secrets in output', async () => {
    await scaffold(makeOptions(), testDir);
    const env = await fse.readFile(join(testDir, '.env.example'), 'utf-8');
    expect(env).not.toMatch(/0x[a-f0-9]{64}/i); // no private keys
    expect(env).not.toContain('app-sk-'); // no API keys
  });

  it('full-stack deps include all SDKs', async () => {
    await scaffold(makeOptions({ template: 'full-stack' }), testDir);
    const pkg = await fse.readJson(join(testDir, 'package.json'));
    expect(pkg.dependencies['@0gfoundation/0g-ts-sdk']).toBeDefined();
    expect(pkg.dependencies['@0glabs/0g-serving-broker']).toBeDefined();
    expect(pkg.dependencies['viem']).toBeDefined();
    expect(pkg.dependencies['openai']).toBeDefined();
  });

  it('minimal deps are lighter', async () => {
    await scaffold(makeOptions({ template: 'minimal' }), testDir);
    const pkg = await fse.readJson(join(testDir, 'package.json'));
    expect(pkg.dependencies['@0gfoundation/0g-ts-sdk']).toBeDefined();
    expect(pkg.dependencies['@0glabs/0g-serving-broker']).toBeUndefined();
    expect(pkg.dependencies['openai']).toBeUndefined();
  });
});
