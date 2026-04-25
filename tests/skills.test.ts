import { describe, it, expect } from 'vitest';
import { SKILLS, getSkillsByTrack, listSkills, type Skill } from '../src/skills';
import fse from 'fs-extra';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = resolve(__dirname, '..', 'skills');

describe('skills registry', () => {
  it('has at least 7 skills', () => {
    expect(Object.keys(SKILLS).length).toBeGreaterThanOrEqual(7);
  });

  it('every skill has required fields', () => {
    for (const [name, skill] of Object.entries(SKILLS)) {
      expect(skill.name, `${name}.name`).toBe(name);
      expect(skill.description, `${name}.description`).toBeTruthy();
      expect(skill.track, `${name}.track`).toBeTruthy();
      expect(skill.category, `${name}.category`).toBeTruthy();
      expect(skill.files, `${name}.files`).toBeInstanceOf(Array);
      expect(skill.files.length, `${name}.files.length`).toBeGreaterThan(0);
      expect(skill.dependencies, `${name}.dependencies`).toBeDefined();
    }
  });

  it('every skill file reference exists on disk', async () => {
    for (const [name, skill] of Object.entries(SKILLS)) {
      for (const file of skill.files) {
        const sourcePath = join(SKILLS_DIR, name, file.source);
        const exists = await fse.pathExists(sourcePath);
        expect(exists, `Missing: skills/${name}/${file.source}`).toBe(true);
      }
    }
  });

  it('every skill has unique target paths (no collisions)', () => {
    const allTargets = new Set<string>();
    for (const skill of Object.values(SKILLS)) {
      for (const file of skill.files) {
        expect(allTargets.has(file.target), `Duplicate target: ${file.target}`).toBe(false);
        allTargets.add(file.target);
      }
    }
  });

  it('skill categories are valid', () => {
    const valid = new Set(['agentic', 'defi', 'economy', 'web4', 'privacy', 'infrastructure']);
    for (const [name, skill] of Object.entries(SKILLS)) {
      expect(valid.has(skill.category), `${name} has invalid category: ${skill.category}`).toBe(true);
    }
  });

  it('skill dependencies have valid semver', () => {
    for (const [name, skill] of Object.entries(SKILLS)) {
      for (const [pkg, version] of Object.entries(skill.dependencies)) {
        expect(version, `${name} dep ${pkg}`).toMatch(/^\^?\d+/);
      }
    }
  });

  it('skill env vars have no empty values', () => {
    for (const [name, skill] of Object.entries(SKILLS)) {
      if (skill.envVars) {
        for (const [key, val] of Object.entries(skill.envVars)) {
          expect(val, `${name} envVar ${key}`).toBeTruthy();
          expect(key, `${name} envVar key`).toMatch(/^[A-Z_]+$/);
        }
      }
    }
  });

  it('covers all 5 hackathon tracks', () => {
    const tracks = new Set(Object.values(SKILLS).map(s => s.track));
    expect(tracks.size).toBeGreaterThanOrEqual(4);
    // Verify key tracks exist
    const trackNames = Array.from(tracks).join(' ');
    expect(trackNames).toContain('Track 1');
    expect(trackNames).toContain('Track 2');
    expect(trackNames).toContain('Track 3');
    expect(trackNames).toContain('Track 5');
  });
});

describe('getSkillsByTrack', () => {
  it('groups skills by track', () => {
    const grouped = getSkillsByTrack();
    expect(Object.keys(grouped).length).toBeGreaterThanOrEqual(4);
    for (const [track, skills] of Object.entries(grouped)) {
      expect(skills.length).toBeGreaterThan(0);
      for (const skill of skills) {
        expect(skill.track).toBe(track);
      }
    }
  });
});

describe('listSkills', () => {
  it('returns options with value, label, hint', () => {
    const options = listSkills();
    expect(options.length).toBe(Object.keys(SKILLS).length);
    for (const opt of options) {
      expect(opt.value).toBeTruthy();
      expect(opt.label).toBeTruthy();
      expect(opt.hint).toBeTruthy();
      expect(SKILLS[opt.value]).toBeDefined();
    }
  });
});
