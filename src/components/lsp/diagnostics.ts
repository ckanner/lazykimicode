import fs from 'node:fs';
import path from 'node:path';

export interface Diagnostic {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

const CACHE_FILE = '.omo/lsp-cache.json';

export function readCache(projectDir: string): string[] {
  const p = path.join(projectDir, CACHE_FILE);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) as string[] : [];
}

export function writeCache(projectDir: string, files: string[]): void {
  const p = path.join(projectDir, CACHE_FILE);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(files));
}

export async function runDiagnostics(_file: string): Promise<Diagnostic[]> {
  // Placeholder: real implementation shells out to lsp-tools-mcp / lsp-daemon.
  return [];
}
