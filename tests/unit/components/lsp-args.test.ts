import { describe, it, expect } from 'vitest';
import { parseLspArgs } from '../../../src/components/lsp/args.js';

describe('parseLspArgs', () => {
  it('splits on whitespace', () => {
    expect(parseLspArgs('--stdio --log-level=verbose')).toEqual(['--stdio', '--log-level=verbose']);
  });

  it('preserves quoted arguments with spaces', () => {
    expect(parseLspArgs('--node-ipc "--project=/path with spaces/tsconfig.json"')).toEqual([
      '--node-ipc',
      '--project=/path with spaces/tsconfig.json',
    ]);
  });

  it('supports single quotes', () => {
    expect(parseLspArgs("--foo 'bar baz'")).toEqual(['--foo', 'bar baz']);
  });

  it('handles escaped quotes', () => {
    expect(parseLspArgs('foo "bar baz"')).toEqual(['foo', 'bar baz']);
  });

  it('keeps Windows path backslashes literal', () => {
    expect(parseLspArgs('C:\\Users\\runner\\server.exe C:\\tmp\\out.log')).toEqual([
      'C:\\Users\\runner\\server.exe',
      'C:\\tmp\\out.log',
    ]);
  });

  it('escapes quotes and backslashes inside double quotes', () => {
    expect(parseLspArgs('"C:\\Program Files\\server.exe" "--config=C:\\dir\\file.json"')).toEqual([
      'C:\\Program Files\\server.exe',
      '--config=C:\\dir\\file.json',
    ]);
  });

  it('returns empty array for empty string', () => {
    expect(parseLspArgs('')).toEqual([]);
  });

  it('returns empty array for whitespace-only string', () => {
    expect(parseLspArgs('   \t\n  ')).toEqual([]);
  });
});
