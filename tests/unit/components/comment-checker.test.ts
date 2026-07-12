import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { checkFile, findStaleMarkers } from '../../../src/components/comment-checker/check.js';

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

  it('detects FIXME, HACK, XXX, BUG in block comments and hash comments', () => {
    const p = path.join(tmp, 'b.py');
    fs.writeFileSync(p, `# FIXME: now\n/* HACK */\n// XXX\n# BUG here\n`);
    const r = checkFile(p);
    expect(r.hasIssue).toBe(true);
    expect(r.matches.length).toBeGreaterThanOrEqual(3);
  });

  it('passes clean files', () => {
    const p = path.join(tmp, 'c.ts');
    fs.writeFileSync(p, 'const x = 1;\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(false);
    expect(r.matches).toHaveLength(0);
  });

  it('ignores TODO inside string literals', () => {
    const p = path.join(tmp, 'd.ts');
    fs.writeFileSync(p, 'const msg = "TODO: not a marker";\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(false);
  });

  it('ignores // TODO inside string literals', () => {
    const p = path.join(tmp, 'line-in-string.ts');
    fs.writeFileSync(p, 'const s = " // TODO in string";\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(false);
  });

  it('ignores markers inside URLs', () => {
    const p = path.join(tmp, 'url.ts');
    fs.writeFileSync(p, 'const url = "https://example.com/TODO#FIXME";\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(false);
  });

  it('still detects TODO after a real line comment', () => {
    const p = path.join(tmp, 'real-comment.ts');
    fs.writeFileSync(p, 'const x = 1; // TODO: real marker\n');
    const r = checkFile(p);
    expect(r.hasIssue).toBe(true);
    expect(r.matches).toContain('TODO');
  });

  it('returns empty result for missing file', () => {
    const r = checkFile(path.join(tmp, 'missing.ts'));
    expect(r.hasIssue).toBe(false);
    expect(r.matches).toHaveLength(0);
  });

  it('detects TODO in block comments', () => {
    const content = 'function foo() {\n  /* TODO: fix this */\n}';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });

  it('detects FIXME in HTML-style comments', () => {
    const content = '<!-- FIXME: broken -->';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('FIXME');
  });

  it('ignores block comment markers inside string literals', () => {
    const content = 'const s = "/* TODO */";';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(0);
  });

  it('ignores block comment markers inside single-quoted strings', () => {
    const content = "const s = '/* FIXME */';";
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(0);
  });

  it('does not double-report the same marker on the same line', () => {
    const content = '// TODO /* TODO */';
    const markers = findStaleMarkers(content);
    expect(markers.filter((m) => m.marker === 'TODO')).toHaveLength(1);
  });

  it('detects TODO with no whitespace before //', () => {
    const markers = findStaleMarkers('const code = 1;// TODO fix\n');
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });

  it('detects TODO after code with whitespace before //', () => {
    const markers = findStaleMarkers('return 1 // TODO fix\n');
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });

  it('ignores TODO inside http:// URLs', () => {
    const markers = findStaleMarkers('const url = "http://example.com/TODO";\n');
    expect(markers).toHaveLength(0);
  });

  it('does not treat /* inside a line comment as a block start', () => {
    const markers = findStaleMarkers('// /* unclosed\nTODO\n');
    expect(markers).toHaveLength(0);
  });

  it('handles backslash runs before closing quotes', () => {
    // '\\' in source is a string containing one backslash; the // TODO after
    // it is a real line comment and should be reported.
    const markers = findStaleMarkers("'\\\\' // TODO\n");
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });

  it('detects hash comment after a hash inside a string literal', () => {
    const markers = findStaleMarkers('const s = " # "; # FIXME after string\n');
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('FIXME');
  });

  it('ignores HTML comments inside string literals', () => {
    const markers = findStaleMarkers('const s = "<!-- TODO in string -->";\n');
    expect(markers).toHaveLength(0);
  });

  it('detects HTML comment after an HTML comment inside a string literal', () => {
    const markers = findStaleMarkers('const s = "<!-- not a comment -->"; <!-- FIXME real -->\n');
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('FIXME');
  });

  it('ignores TODO inside multi-line template literals', () => {
    const content = 'const msg = `first line\nTODO: not a marker\nthird line`;\n';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(0);
  });

  it('ignores TODO inside template literal interpolation', () => {
    const content = 'const x = `${foo ? "TODO: not a marker" : "ok"}`;\n';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(0);
  });

  it('ignores escaped backticks and TODO inside template literals', () => {
    const content = 'const msg = `escaped \\` TODO: not a marker`;\n';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(0);
  });

  it('detects TODO after a multi-line template literal ends', () => {
    const content = 'const msg = `multi\nline`; // TODO: real marker\n';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });

  it('detects TODO inside a block comment after a multi-line template literal', () => {
    const content = 'const msg = `multi\nline`; /* TODO: real marker */\n';
    const markers = findStaleMarkers(content);
    expect(markers).toHaveLength(1);
    expect(markers[0].marker).toBe('TODO');
  });
});
