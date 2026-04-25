/**
 * `create-0g-dapp add <skill>` command
 *
 * Adds a skill (components, API routes, libs) to an existing 0G project.
 * Follows the shadcn pattern: copy files, install deps, update env.
 */

import * as p from '@clack/prompts';
import chalk from 'chalk';
import fse from 'fs-extra';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { SKILLS, listSkills, type Skill } from './skills.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, '..', 'skills');

export async function runAdd(skillName?: string) {
  p.intro(chalk.bgHex('#9200E1').white(' create-0g-dapp add '));

  // Check we're in a 0G project
  const pkgPath = join(process.cwd(), 'package.json');
  if (!await fse.pathExists(pkgPath)) {
    p.cancel('No package.json found. Run this from inside a create-0g-dapp project.');
    process.exit(1);
  }

  // Select skill
  const selected = skillName || await p.select({
    message: 'Which skill would you like to add?',
    options: listSkills(),
  }) as string;

  if (p.isCancel(selected)) { p.cancel('Cancelled.'); process.exit(0); }

  const skill = SKILLS[selected];
  if (!skill) {
    p.cancel(`Unknown skill: ${selected}. Run with --list to see available skills.`);
    process.exit(1);
  }

  p.note(
    [
      `${chalk.bold('Skill:')}    ${skill.name}`,
      `${chalk.bold('Track:')}    ${skill.track}`,
      `${chalk.bold('About:')}    ${skill.description}`,
      `${chalk.bold('Files:')}    ${skill.files.length} files`,
      skill.envVars ? `${chalk.bold('Env:')}      ${Object.keys(skill.envVars).join(', ')}` : '',
    ].filter(Boolean).join('\n'),
    'Adding skill'
  );

  const projectDir = process.cwd();
  const skillSourceDir = join(SKILLS_DIR, skill.name);

  // Copy files
  let created = 0;
  let skipped = 0;

  for (const file of skill.files) {
    const sourcePath = join(skillSourceDir, file.source);
    const targetPath = join(projectDir, file.target);

    if (!await fse.pathExists(sourcePath)) {
      p.log.warn(`Source not found: ${file.source} — skipping`);
      skipped++;
      continue;
    }

    if (await fse.pathExists(targetPath)) {
      p.log.warn(`Already exists: ${file.target} — skipping (use --overwrite to replace)`);
      skipped++;
      continue;
    }

    await fse.ensureDir(dirname(targetPath));
    await fse.copy(sourcePath, targetPath);
    p.log.success(`Created: ${file.target}`);
    created++;
  }

  // Install dependencies
  if (Object.keys(skill.dependencies).length > 0) {
    const deps = Object.entries(skill.dependencies).map(([k, v]) => `${k}@${v}`).join(' ');
    p.log.step(`Installing: ${deps}`);
    try {
      execSync(`npm install ${deps}`, { cwd: projectDir, stdio: 'inherit' });
    } catch {
      p.log.warn('Dependency install failed — run manually');
    }
  }

  // Append env vars to .env.example
  if (skill.envVars) {
    const envPath = join(projectDir, '.env.example');
    if (await fse.pathExists(envPath)) {
      const existing = await fse.readFile(envPath, 'utf-8');
      const newVars = Object.entries(skill.envVars)
        .filter(([key]) => !existing.includes(key))
        .map(([key, val]) => `\n# Added by skill: ${skill.name}\n${key}=${val}`)
        .join('');
      if (newVars) {
        await fse.appendFile(envPath, newVars + '\n');
        p.log.success('Updated .env.example with new variables');
      }
    }
  }

  p.note(
    `Created ${created} files, skipped ${skipped}.${
      skill.envVars ? `\nCheck .env.example for new variables.` : ''
    }`,
    'Done'
  );

  p.outro(chalk.green(`Skill "${skill.name}" added!`));
}

export async function runList() {
  p.intro(chalk.bgHex('#9200E1').white(' create-0g-dapp skills '));

  const tracks = new Map<string, typeof SKILLS[string][]>();
  for (const skill of Object.values(SKILLS)) {
    if (!tracks.has(skill.track)) tracks.set(skill.track, []);
    tracks.get(skill.track)!.push(skill);
  }

  for (const [track, skills] of tracks) {
    console.log(`\n${chalk.bold.hex('#9200E1')(track)}`);
    for (const s of skills) {
      console.log(`  ${chalk.bold(s.name)} — ${chalk.dim(s.description)}`);
    }
  }
  console.log('');
  p.outro(`Run ${chalk.cyan('npx create-0g-dapp add <skill>')} to install one.`);
}
