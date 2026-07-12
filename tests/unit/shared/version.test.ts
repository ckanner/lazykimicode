import { describe, it, expect } from 'vitest';
import { VERSION } from '../../../src/shared/version.js';
import pkg from '../../../package.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

describe('VERSION', () => {
  it('matches package.json version', () => {
    expect(VERSION).toBe(pkg.version);
  });

  it('build stamps version.ts and plugin manifest', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'build-version-'));
    try {
      const projectRoot = path.resolve('.');
      fs.cpSync(projectRoot, tmpDir, {
        recursive: true,
        filter: (src) => {
          const rel = path.relative(projectRoot, src);
          if (!rel) return true;
          const top = rel.split(path.sep)[0];
          if (['.git', 'node_modules', 'dist'].includes(top)) return false;
          if (rel.startsWith('plugin/components')) return false;
          return true;
        },
      });
      fs.symlinkSync(path.join(projectRoot, 'node_modules'), path.join(tmpDir, 'node_modules'), 'dir');

      execFileSync('node', ['scripts/build.mjs'], {
        cwd: tmpDir,
        env: { ...process.env, LAZYKIMICODE_POSTHOG_API_KEY: 'test-key' },
      });

      const versionTs = fs.readFileSync(path.join(tmpDir, 'src', 'shared', 'version.ts'), 'utf-8');
      expect(versionTs).toContain(pkg.version);

      const manifest = JSON.parse(fs.readFileSync(path.join(tmpDir, 'plugin', 'kimi.plugin.json'), 'utf-8'));
      expect(manifest.version).toBe(pkg.version);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
