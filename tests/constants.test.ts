import { describe, it, expect } from 'vitest';
import { NETWORKS, TEMPLATES, TEMPLATE_DEPS, SDK_VERSIONS } from '../src/constants';

describe('constants', () => {
  it('mainnet has correct chain id', () => {
    expect(NETWORKS.mainnet.chainId).toBe(16661);
  });

  it('testnet has correct chain id', () => {
    expect(NETWORKS.testnet.chainId).toBe(16600);
  });

  it('mainnet and testnet have different RPCs', () => {
    expect(NETWORKS.mainnet.chainRpcUrl).not.toBe(NETWORKS.testnet.chainRpcUrl);
  });

  it('all network configs have required fields', () => {
    for (const [name, config] of Object.entries(NETWORKS)) {
      expect(config.chainId, `${name}.chainId`).toBeGreaterThan(0);
      expect(config.chainRpcUrl, `${name}.chainRpcUrl`).toMatch(/^https:\/\//);
      expect(config.chainScanBaseUrl, `${name}.chainScanBaseUrl`).toMatch(/^https:\/\//);
      expect(config.storageIndexUrl, `${name}.storageIndexUrl`).toMatch(/^https:\/\//);
      expect(config.storageFlowAddress, `${name}.storageFlowAddress`).toMatch(/^0x/);
    }
  });

  it('all templates have deps defined', () => {
    for (const key of Object.keys(TEMPLATES)) {
      expect(TEMPLATE_DEPS[key as keyof typeof TEMPLATE_DEPS], `deps for ${key}`).toBeDefined();
    }
  });

  it('SDK versions are valid semver ranges', () => {
    for (const [pkg, version] of Object.entries(SDK_VERSIONS)) {
      expect(version, pkg).toMatch(/^\^?\d+\.\d+\.\d+/);
    }
  });
});
