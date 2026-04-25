import { describe, it, expect, afterEach, vi } from 'vitest';
import { detectPackageManager } from '../src/install';

describe('detectPackageManager', () => {
  const originalEnv = process.env.npm_config_user_agent;

  afterEach(() => {
    process.env.npm_config_user_agent = originalEnv;
  });

  it('detects npm', () => {
    process.env.npm_config_user_agent = 'npm/10.2.0 node/v21.0.0';
    expect(detectPackageManager()).toBe('npm');
  });

  it('detects pnpm', () => {
    process.env.npm_config_user_agent = 'pnpm/8.10.0 npm/? node/v20.0.0';
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('detects yarn', () => {
    process.env.npm_config_user_agent = 'yarn/4.0.0 npm/? node/v20.0.0';
    expect(detectPackageManager()).toBe('yarn');
  });

  it('detects bun', () => {
    process.env.npm_config_user_agent = 'bun/1.0.0 node/v20.0.0';
    expect(detectPackageManager()).toBe('bun');
  });

  it('defaults to npm when user agent is empty', () => {
    process.env.npm_config_user_agent = '';
    expect(detectPackageManager()).toBe('npm');
  });

  it('defaults to npm when user agent is undefined', () => {
    delete process.env.npm_config_user_agent;
    expect(detectPackageManager()).toBe('npm');
  });
});
