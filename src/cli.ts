import * as p from '@clack/prompts';
import chalk from 'chalk';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { TEMPLATES, NETWORKS, type Template, type Network, type PackageManager } from './constants.js';
import { scaffold } from './scaffold.js';
import { installDependencies, initGit, detectPackageManager } from './install.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));
    return pkg.version || '0.1.0';
  } catch {
    return '0.1.0';
  }
}

export interface CliOptions {
  projectName: string;
  template: Template;
  network: Network;
  packageManager: PackageManager;
  git: boolean;
  install: boolean;
}

export async function run() {
  const program = new Command()
    .name('create-0g-dapp')
    .version(getVersion())
    .description('Scaffold a Next.js app with the 0G decentralized AI network')
    .argument('[project-name]', 'Name of the project directory')
    .option('-t, --template <template>', 'Template: full-stack | ai-agent | storage-dapp | minimal')
    .option('-n, --network <network>', 'Network: mainnet | testnet')
    .option('--pm <manager>', 'Package manager: npm | pnpm | yarn | bun')
    .option('--no-git', 'Skip git init')
    .option('--no-install', 'Skip dependency installation');

  program.parse();
  const args = program.args;
  const flags = program.opts();

  console.log('');
  p.intro(chalk.bgHex('#FF5C16').black(' create-0g-dapp '));

  const projectName = args[0] || await p.text({
    message: 'What is your project named?',
    placeholder: 'my-0g-app',
    defaultValue: 'my-0g-app',
    validate: (value) => {
      if (!value) return 'Project name is required';
      if (!/^[a-z0-9._-]+$/i.test(value)) return 'Invalid name — use letters, numbers, hyphens, dots';
    },
  }) as string;

  if (p.isCancel(projectName)) {
    p.cancel('Cancelled.');
    process.exit(0);
  }

  const template = (flags.template as Template) || await p.select({
    message: 'Which template would you like?',
    options: Object.entries(TEMPLATES).map(([value, { label, hint }]) => ({
      value: value as Template,
      label,
      hint,
    })),
    initialValue: 'ai-agent' as Template,
  }) as Template;

  if (p.isCancel(template)) { p.cancel('Cancelled.'); process.exit(0); }

  const network = (flags.network as Network) || await p.select({
    message: 'Which 0G network?',
    options: [
      { value: 'mainnet' as Network, label: '0G Mainnet', hint: `Chain ID ${NETWORKS.mainnet.chainId} — ${NETWORKS.mainnet.chainRpcUrl}` },
      { value: 'testnet' as Network, label: '0G Testnet', hint: `Chain ID ${NETWORKS.testnet.chainId} — ${NETWORKS.testnet.chainRpcUrl}` },
    ],
    initialValue: 'mainnet' as Network,
  }) as Network;

  if (p.isCancel(network)) { p.cancel('Cancelled.'); process.exit(0); }

  const detectedPm = detectPackageManager();
  const packageManager = (flags.pm as PackageManager) || await p.select({
    message: 'Which package manager?',
    options: [
      { value: 'npm' as PackageManager, label: 'npm' },
      { value: 'pnpm' as PackageManager, label: 'pnpm' },
      { value: 'yarn' as PackageManager, label: 'yarn' },
      { value: 'bun' as PackageManager, label: 'bun' },
    ],
    initialValue: detectedPm,
  }) as PackageManager;

  if (p.isCancel(packageManager)) { p.cancel('Cancelled.'); process.exit(0); }

  const shouldGit = flags.git !== false ? await p.confirm({
    message: 'Initialize a git repository?',
    initialValue: true,
  }) as boolean : false;

  if (p.isCancel(shouldGit)) { p.cancel('Cancelled.'); process.exit(0); }

  const shouldInstall = flags.install !== false ? await p.confirm({
    message: 'Install dependencies?',
    initialValue: true,
  }) as boolean : false;

  if (p.isCancel(shouldInstall)) { p.cancel('Cancelled.'); process.exit(0); }

  const projectDir = resolve(process.cwd(), projectName);
  const networkConfig = NETWORKS[network];

  p.note(
    [
      `${chalk.bold('Project:')}    ${projectName}`,
      `${chalk.bold('Template:')}   ${TEMPLATES[template].label}`,
      `${chalk.bold('Network:')}    0G ${network} (Chain ID ${networkConfig.chainId})`,
      `${chalk.bold('RPC:')}        ${networkConfig.chainRpcUrl}`,
      `${chalk.bold('PM:')}         ${packageManager}`,
      `${chalk.bold('Directory:')}  ${projectDir}`,
    ].join('\n'),
    'Configuration'
  );

  const options: CliOptions = {
    projectName,
    template,
    network,
    packageManager,
    git: shouldGit,
    install: shouldInstall,
  };

  // Scaffold
  const s = p.spinner();
  s.start('Scaffolding project...');
  await scaffold(options, projectDir);
  s.stop('Project scaffolded.');

  // Install dependencies
  if (shouldInstall) {
    s.start(`Installing dependencies with ${packageManager}...`);
    await installDependencies(projectDir, packageManager);
    s.stop('Dependencies installed.');
  }

  // Git init
  if (shouldGit) {
    s.start('Initializing git repository...');
    await initGit(projectDir);
    s.stop('Git repository initialized.');
  }

  const runCmd = packageManager === 'npm' ? 'npm run' : packageManager;

  p.note(
    [
      chalk.bold(`cd ${projectName}`),
      '',
      '1. Copy .env.example to .env.local and fill in your keys',
      `2. Run: ${chalk.cyan(`${runCmd} dev`)}`,
      '3. Open http://localhost:3000',
      `4. Check 0G health: ${chalk.cyan('http://localhost:3000/api/0g/health')}`,
      '',
      `${chalk.dim('Docs:')}   https://docs.0g.ai`,
      `${chalk.dim('Guide:')}  ./AGENT.md`,
    ].join('\n'),
    'Next steps'
  );

  p.outro(chalk.green('Your 0G app is ready!'));
}
