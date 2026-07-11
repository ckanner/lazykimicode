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

const PROXIMITY_LINES = 5;

function lineOf(text: string, search: string): number {
  const idx = text.indexOf(search);
  if (idx === -1) return -1;
  return text.slice(0, idx).split('\n').length;
}

function firstBodyLineOf(text: string, search: string): number {
  const lines = text.split('\n');
  let bodyStart = 0;
  let frontmatterDelims = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      frontmatterDelims++;
      if (frontmatterDelims === 2) {
        bodyStart = i + 1;
        break;
      }
    }
  }
  const body = lines.slice(bodyStart).join('\n');
  const bodyLine = lineOf(body, search);
  if (bodyLine === -1) return -1;
  return bodyStart + bodyLine;
}

describe('skill fallback handlers', () => {
  for (const name of WEBBRIDGE_SKILLS) {
    it(`${name} includes kimi-webbridge fallback near its first body reference`, () => {
      const content = fs.readFileSync(
        path.join(SKILLS_DIR, name, 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain(KIMI_WEBBRIDGE_FALLBACK);

      const referenceLine = firstBodyLineOf(content, 'kimi-webbridge');
      const fallbackLine = lineOf(content, KIMI_WEBBRIDGE_FALLBACK);
      expect(referenceLine).toBeGreaterThan(0);
      expect(fallbackLine).toBeGreaterThan(referenceLine);
      expect(fallbackLine - referenceLine).toBeLessThanOrEqual(
        PROXIMITY_LINES,
      );
    });
  }

  for (const name of REFERENCES_SKILLS) {
    it(`${name} includes references/ fallback near its first body reference`, () => {
      const content = fs.readFileSync(
        path.join(SKILLS_DIR, name, 'SKILL.md'),
        'utf-8',
      );
      expect(content).toContain(REFERENCES_FALLBACK);

      const referenceLine = firstBodyLineOf(content, 'references/');
      const fallbackLine = lineOf(content, REFERENCES_FALLBACK);
      expect(referenceLine).toBeGreaterThan(0);
      expect(fallbackLine).toBeGreaterThan(referenceLine);
      expect(fallbackLine - referenceLine).toBeLessThanOrEqual(
        PROXIMITY_LINES,
      );
    });
  }
});
