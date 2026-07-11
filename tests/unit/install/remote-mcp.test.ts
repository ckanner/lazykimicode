import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../../..');
const rootMcp = path.join(ROOT, '.mcp.json');
const pluginMcp = path.join(ROOT, 'plugin', '.mcp.json');

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
}

describe('remote MCP defaults', () => {
  it('provides a root .mcp.json matching plugin/.mcp.json', () => {
    expect(fs.existsSync(rootMcp)).toBe(true);
    const root = readJson<Record<string, unknown>>(rootMcp);
    const plugin = readJson<Record<string, unknown>>(pluginMcp);
    expect(root).toEqual(plugin);
  });

  it('keeps remote MCPs disabled by default', () => {
    const root = readJson<Record<string, { enabled?: boolean }>>(rootMcp);
    for (const [, cfg] of Object.entries(root)) {
      expect(cfg.enabled).toBe(false);
    }
  });

  it('each entry has url and note', () => {
    const root = readJson<Record<string, { url?: string; note?: string }>>(rootMcp);
    for (const [name, cfg] of Object.entries(root)) {
      expect(cfg.url, `${name} missing url`).toBeTruthy();
      expect(cfg.note, `${name} missing note`).toBeTruthy();
    }
  });
});
