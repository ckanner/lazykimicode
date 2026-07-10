import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { readCache, writeCache } from '../../../src/components/lsp/diagnostics.js';

describe('lsp', () => {
  let tmp: string;
  beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lsp-')); });
  afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('reads and writes cache', () => {
    expect(readCache(tmp)).toEqual([]);
    writeCache(tmp, ['a.ts', 'b.ts']);
    expect(readCache(tmp)).toEqual(['a.ts', 'b.ts']);
  });
});
