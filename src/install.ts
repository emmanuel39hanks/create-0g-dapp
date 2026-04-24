import { execSync } from 'child_process';
import type { PackageManager } from './constants.js';

export function detectPackageManager(): PackageManager {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  if (userAgent.startsWith('bun')) return 'bun';
  return 'npm';
}

export async function installDependencies(projectDir: string, pm: PackageManager): Promise<void> {
  const commands: Record<PackageManager, string> = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn',
    bun: 'bun install',
  };

  execSync(commands[pm], {
    cwd: projectDir,
    stdio: 'pipe',
    env: { ...process.env, ADBLOCK: '1', DISABLE_OPENCOLLECTIVE: '1' },
  });
}

export async function initGit(projectDir: string): Promise<void> {
  try {
    execSync('git init', { cwd: projectDir, stdio: 'pipe' });
    execSync('git add -A', { cwd: projectDir, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from create-0g-app"', {
      cwd: projectDir,
      stdio: 'pipe',
    });
  } catch {
    // Git not available or failed — not critical
  }
}
