#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const built = path.resolve(__dirname, '..', 'dist', 'cli', 'index.mjs');
if (!fs.existsSync(built)) {
  console.error('Built installer not found. Run `pnpm run build` first.');
  process.exit(1);
}
const args = [built, ...process.argv.slice(2)];
console.error('[install-local] spawn', process.execPath, args);
const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
console.error('[install-local] spawn exit', result.status, result.error?.message);
process.exit(result.status ?? 1);
