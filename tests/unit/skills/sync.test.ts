import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const SKILL_DIR = path.join(ROOT, 'plugin', 'skills');

const EXPECTED_SKILLS = [
  'ast-grep', 'coding-agent-sessions', 'debugging', 'frontend', 'git-master',
  'init-deep', 'lcx-contribute-bug-fix', 'lcx-doctor', 'lcx-report-bug',
  'lsp-setup', 'programming', 'refactor', 'remove-ai-slops', 'review-work',
  'rules', 'start-work', 'teammode', 'ultimate-browsing', 'ultrawork',
  'ulw-loop', 'ulw-plan', 'ulw-research', 'visual-qa',
];

const REQUIRED_FIELDS = ['name', 'description', 'type', 'whenToUse'];

const RAW_CODEX_MARKERS = [
  'multi_agent_v1',
  'codex_app',
  'apply_patch',
  'browser:control-in-app-browser',
  'create_thread',
  'send_message_to_thread',
  'read_thread',
];

function parseFrontmatter(content: string): Record<string, string> | null {
  const lines = content.split('\n');
  if (lines[0] !== '---') return null;
  const end = lines.indexOf('---', 1);
  if (end === -1) return null;
  const frontmatter: Record<string, string> = {};
  for (let i = 1; i < end; i++) {
    const line = lines[i];
    const idx = line.indexOf(':');
    if (idx > 0) {
      frontmatter[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  }
  return frontmatter;
}

describe('skill sync', () => {
  const actual = fs.readdirSync(SKILL_DIR).filter((name) =>
    fs.existsSync(path.join(SKILL_DIR, name, 'SKILL.md')),
  );

  it('every actual skill is in the expected list', () => {
    for (const name of actual) {
      expect(EXPECTED_SKILLS).toContain(name);
    }
  });

  it('every expected skill exists on disk', () => {
    for (const name of EXPECTED_SKILLS) {
      expect(fs.existsSync(path.join(SKILL_DIR, name, 'SKILL.md'))).toBe(true);
    }
  });
});

describe('skill quality', () => {
  const actual = fs.readdirSync(SKILL_DIR).filter((name) =>
    fs.existsSync(path.join(SKILL_DIR, name, 'SKILL.md')),
  );

  it('each skill has valid frontmatter with required fields', () => {
    for (const name of actual) {
      const content = fs.readFileSync(path.join(SKILL_DIR, name, 'SKILL.md'), 'utf-8');
      const frontmatter = parseFrontmatter(content);
      expect(frontmatter, `${name}: missing or malformed frontmatter`).not.toBeNull();
      for (const field of REQUIRED_FIELDS) {
        expect(frontmatter?.[field], `${name}: missing ${field}`).toBeTruthy();
      }
    }
  });

  it('no raw Codex tool calls appear before the Kimi Code Harness Compatibility section', () => {
    for (const name of actual) {
      const content = fs.readFileSync(path.join(SKILL_DIR, name, 'SKILL.md'), 'utf-8');
      const compatMatch = content.match(/#{1,6}\s+Kimi Code Harness Compatibility/i);
      const beforeCompat = compatMatch ? content.slice(0, compatMatch.index) : content;
      for (const marker of RAW_CODEX_MARKERS) {
        expect(beforeCompat).not.toContain(marker);
      }
    }
  });
});
