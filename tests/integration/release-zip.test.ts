import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('release zip', () => {
  it('contains dist/ and bin/ and runs --help', () => {
    execSync('pnpm run build', { stdio: 'ignore' });
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'release-zip-'));
    try {
      execSync('zip -r lazykimicode.zip plugin scripts bin dist package.json', { stdio: 'ignore' });
      execSync('unzip -q lazykimicode.zip -d ' + tmp);
      const help = execSync('node ' + path.join(tmp, 'bin', 'lazykimicode.mjs') + ' --help', { encoding: 'utf-8' });
      expect(help).toContain('lazykimicode');
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
      fs.rmSync('lazykimicode.zip', { force: true });
    }
  });
});
