import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const SKILLS_DIR = path.resolve(import.meta.dirname, '../../../plugin/skills');

const KIMI_WEBBRIDGE_FALLBACK =
  '> **Fallback if `kimi-webbridge` is not available:** Use `FetchURL` to read the page, or ask the user to perform the browser step manually and paste the result.';

const REFERENCES_FALLBACK =
  "> **Fallback if `references/` are not present:** Use the project's existing code style, `AGENTS.md`, and general engineering knowledge. Ask the user for specific design constraints if needed.";

const WEBBRIDGE_SKILLS = [
  'ultimate-browsing',
  'ultrawork',
  'visual-qa',
  'lcx-contribute-bug-fix',
  'lcx-doctor',
  'lcx-report-bug',
];

const REFERENCES_SKILLS = ['frontend', 'programming'];

describe('skill fallback handlers', () => {
  for (const name of WEBBRIDGE_SKILLS) {
    it(`${name} includes kimi-webbridge fallback`, () => {
      const content = fs.readFileSync(
        path.join(SKILLS_DIR, name, 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain(KIMI_WEBBRIDGE_FALLBACK);
    });
  }

  for (const name of REFERENCES_SKILLS) {
    it(`${name} includes references/ fallback`, () => {
      const content = fs.readFileSync(
        path.join(SKILLS_DIR, name, 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain(REFERENCES_FALLBACK);
    });
  }
});
