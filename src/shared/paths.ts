import path from 'node:path';
import os from 'node:os';
import { VERSION } from './version.js';
import { getEnv, getProjectDir, getKimiCodeHome, getConfigDir } from './env.js';

export interface PathOptions {
  kimiCodeHome?: string;
  projectDirectory?: string;
  binDir?: string;
  version?: string;
}

export function resolveKimiEnv(options: PathOptions = {}): {
  kimiCodeHome: string;
  projectDirectory: string;
  binDir: string;
  version: string;
} {
  const defaultHome = path.join(os.homedir(), '.kimi-code');
  const kimiCodeHome = options.kimiCodeHome ?? getKimiCodeHome();
  const projectDirectory = options.projectDirectory ?? getProjectDir();
  const binDir = options.binDir
    ?? process.env.KIMI_LOCAL_BIN_DIR
    ?? (kimiCodeHome === defaultHome ? path.join(os.homedir(), '.local', 'bin') : path.join(kimiCodeHome, 'bin'));
  const version = options.version ?? getEnv('VERSION') ?? VERSION;

  return { kimiCodeHome, projectDirectory, binDir, version };
}

export function pluginCacheDir(kimiCodeHome: string, version: string): string {
  return path.join(kimiCodeHome, 'plugins', 'cache', 'lazykimicode', version);
}

export { getConfigDir };
