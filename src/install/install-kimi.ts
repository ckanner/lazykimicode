import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as toml from 'smol-toml';
import { resolveKimiEnv, pluginCacheDir, omoConfigDir } from '../shared/paths.js';
import { getHookDefs } from './hook-defs.js';
import { patchConfigToml } from './config-patcher.js';
import { linkManagedBins, unlinkManagedBins } from './bin-links.js';

export interface InstallOptions {
  kimiCodeHome?: string;
  projectDirectory?: string;
  binDir?: string;
  dryRun?: boolean;
  noTui?: boolean;
  autonomous?: boolean;
}

function getPluginRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'plugin');
}

function seedOmoConfig(options: InstallOptions): void {
  if (options.dryRun) return;
  const dir = omoConfigDir();
  fs.mkdirSync(dir, { recursive: true });
  const configPath = path.join(dir, 'config.jsonc');
  if (fs.existsSync(configPath)) return;
  const config = {
    '//': 'Oh My KimiCode user configuration',
    telemetry: { enabled: process.env.OMO_KIMI_DISABLE_POSTHOG !== '1' },
    ultrawork: { autoCreateGoal: true },
  };
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

function applyAutonomousMode(kimiCodeHome: string, dryRun = false): void {
  const configPath = path.join(kimiCodeHome, 'config.toml');
  if (!fs.existsSync(configPath)) return;
  const raw = fs.readFileSync(configPath, 'utf-8');
  const parsed = toml.parse(raw) as Record<string, unknown>;
  if (parsed.default_permission_mode === 'auto') return;
  parsed.default_permission_mode = 'auto';
  const serialized = toml.stringify(parsed as toml.TomlPrimitive);
  if (dryRun) {
    console.log('Autonomous mode would set default_permission_mode = "auto"');
    return;
  }
  fs.writeFileSync(configPath, serialized, 'utf-8');
}

export async function runKimiInstaller(options: InstallOptions = {}): Promise<void> {
  const env = resolveKimiEnv(options);
  const version = process.env.OMO_KIMI_VERSION ?? '0.1.0';
  const cache = pluginCacheDir(env.kimiCodeHome, version);

  if (!options.dryRun) {
    fs.rmSync(cache, { recursive: true, force: true });
    fs.mkdirSync(cache, { recursive: true });
    fs.cpSync(getPluginRoot(), cache, { recursive: true });
    linkManagedBins(cache, env.binDir);
    seedOmoConfig(options);
  }

  const configPath = path.join(env.kimiCodeHome, 'config.toml');
  const hooks = getHookDefs(version, cache);
  const result = patchConfigToml(configPath, hooks, options.dryRun);

  if (options.autonomous && !options.dryRun) {
    applyAutonomousMode(env.kimiCodeHome, options.dryRun);
  }

  if (options.dryRun) {
    console.log('Dry run. Proposed changes:');
    console.log(result.diff);
    if (options.autonomous) {
      applyAutonomousMode(env.kimiCodeHome, true);
    }
    return;
  }

  console.log(`Installed oh-my-kimicode ${version} to ${cache}`);
  if (result.backupPath) console.log(`Backed up config to ${result.backupPath}`);
}

export interface UninstallOptions {
  kimiCodeHome?: string;
  binDir?: string;
  preserveRules?: boolean;
}

export async function runKimiUninstaller(options: UninstallOptions = {}): Promise<void> {
  const env = resolveKimiEnv(options);
  const configPath = path.join(env.kimiCodeHome, 'config.toml');

  // Remove managed hook entries from config.toml.
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = toml.parse(raw) as Record<string, unknown>;
    const hooks = (parsed.hooks ?? []) as Array<Record<string, unknown>>;
    const remaining = hooks.filter((h) => {
      const cmd = String(h.command ?? '');
      return !cmd.includes('oh-my-kimicode');
    });
    if (remaining.length !== hooks.length) {
      parsed.hooks = remaining;
      fs.writeFileSync(configPath, toml.stringify(parsed as toml.TomlPrimitive), 'utf-8');
      console.log(`Removed oh-my-kimicode hooks from ${configPath}`);
    }
  }

  // Remove plugin cache directories.
  const cacheParent = path.join(env.kimiCodeHome, 'plugins', 'cache', 'oh-my-kimicode');
  if (fs.existsSync(cacheParent)) {
    fs.rmSync(cacheParent, { recursive: true, force: true });
    console.log(`Removed plugin cache ${cacheParent}`);
  }

  // Remove bin links.
  unlinkManagedBins(env.binDir);
  console.log(`Removed managed binaries from ${env.binDir}`);

  if (!options.preserveRules) {
    const omoDir = omoConfigDir();
    if (fs.existsSync(omoDir)) {
      fs.rmSync(omoDir, { recursive: true, force: true });
      console.log(`Removed user rules/config ${omoDir}`);
    }
  }

  console.log('Uninstalled oh-my-kimicode');
}
