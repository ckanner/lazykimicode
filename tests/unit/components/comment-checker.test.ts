import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkFile } from '../../../src/components/comment-checker/check.js';

describe('comment-checker', () => {
  let tmp: string;
  beforeEach(() => { tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-')); });
  afterEach(() => { fs.rmSync(tmp, { recursive: true, force: true }); });

  it('detects TODO in source', () => {
    const p = path.join(tmp, 'a.ts');
    fs.writeFileSync(p, '// TODO: fix this\nconst x = 1;\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(true);
    expect(r.matches).toHaveLength(1);
  });

  it('passes clean files', () => {
    const p = path.join(tmp, 'b.ts');
    fs.writeFileSync(p, 'const x = 1;\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(false);
  });
});
