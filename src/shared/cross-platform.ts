import { execFileSync, execSync } from 'node:child_process';

export function findOnPath(name: string): string | null {
  const cmd = process.platform === 'win32' ? 'where' : 'which';
  try {
    const out = execFileSync(cmd, [name], { encoding: 'utf-8', timeout: 5000 }).trim();
    return out.split(/\r?\n/)[0] || null;
  } catch {
    return null;
  }
}

export function runVersion(command: string, fallbackPath?: string): string {
  const candidates = fallbackPath ? [fallbackPath, command] : [command];
  for (const candidate of candidates) {
    try {
      if (process.platform === 'win32' && /\.(cmd|bat)$/i.test(candidate)) {
        return execSync(`"${candidate}" --version`, { encoding: 'utf-8', timeout: 5000 }).trim();
      }
      return execFileSync(candidate, ['--version'], { encoding: 'utf-8', timeout: 5000 }).trim();
    } catch {
      // try next candidate
    }
  }
  throw new Error(`${command} --version failed`);
}
