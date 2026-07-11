import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const modulePath = '../../../src/components/git-bash/mcp-server.js';

describe('git-bash mcp-server findBashPath', () => {
  let existsSyncSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    existsSyncSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    // clear module cache to re-import
    vi.resetModules();
  });

  afterEach(() => {
    existsSyncSpy.mockRestore();
  });

  it('returns the first existing candidate', async () => {
    existsSyncSpy.mockImplementation((p: fs.PathLike) =>
      String(p).includes('Git\\bin\\bash.exe'),
    );
    const { findBashPath } = await import(modulePath);
    expect(findBashPath()).toContain('Git');
  });

  it('returns null when no candidate exists', async () => {
    const { findBashPath } = await import(modulePath);
    expect(findBashPath()).toBeNull();
  });

  it('resolves a bare-name candidate against PATH', async () => {
    const tmpBin = fs.mkdtempSync(path.join(os.tmpdir(), 'git-bash-path-'));
    const bashFile = path.join(tmpBin, 'bash');
    fs.writeFileSync(bashFile, '', 'utf-8');
    const originalPath = process.env.PATH;
    process.env.PATH = `${tmpBin}${path.delimiter}${originalPath ?? ''}`;
    try {
      existsSyncSpy.mockImplementation((p: fs.PathLike) => String(p) === bashFile);
      const { findBashPath } = await import(modulePath);
      expect(findBashPath()).toBe(bashFile);
    } finally {
      process.env.PATH = originalPath;
      fs.rmSync(tmpBin, { recursive: true, force: true });
    }
  });

  it('resolves bash.exe against PATH', async () => {
    const tmpBin = fs.mkdtempSync(path.join(os.tmpdir(), 'git-bash-win-'));
    const bashExe = path.join(tmpBin, 'bash.exe');
    fs.writeFileSync(bashExe, '', 'utf-8');
    const originalPath = process.env.PATH;
    process.env.PATH = `${tmpBin}${path.delimiter}${originalPath ?? ''}`;
    try {
      existsSyncSpy.mockImplementation((p: fs.PathLike) => String(p) === bashExe);
      const { findBashPath } = await import(modulePath);
      expect(findBashPath()).toBe(bashExe);
    } finally {
      process.env.PATH = originalPath;
      fs.rmSync(tmpBin, { recursive: true, force: true });
    }
  });
});
