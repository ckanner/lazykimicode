import os from 'node:os';
import path from 'node:path';

/**
 * Read a lazykimicode environment variable.
 *
 * New code should use the `LAZYKIMICODE_*` namespace. The legacy `OMO_KIMI_*`
 * aliases are still accepted as fallbacks so existing user configurations keep
 * working during the rebrand transition.
 */
export function getEnv(name: string, fallback?: string): string | undefined {
  const primary = process.env[`LAZYKIMICODE_${name}`];
  if (primary !== undefined) return primary;
  const legacy = process.env[`OMO_KIMI_${name}`];
  if (legacy !== undefined) return legacy;
  return fallback;
}

/** Read a boolean-ish env var; returns true only when the value is exactly '1' or 'true'. */
export function getEnvBool(name: string): boolean {
  const primary = process.env[`LAZYKIMICODE_${name}`];
  if (primary !== undefined) {
    return primary === '1' || primary.toLowerCase() === 'true';
  }
  const legacy = process.env[`OMO_KIMI_${name}`];
  if (legacy !== undefined) {
    return legacy === '1' || legacy.toLowerCase() === 'true';
  }
  return false;
}

/** Legacy telemetry disable aliases. */
export function isTelemetryDisabled(): boolean {
  const disabled =
    process.env.LAZYKIMICODE_DISABLE_POSTHOG === '1' ||
    process.env.LAZYKIMICODE_DISABLE_POSTHOG?.toLowerCase() === 'true' ||
    process.env.OMO_KIMI_DISABLE_POSTHOG === '1' ||
    process.env.OMO_KIMI_DISABLE_POSTHOG?.toLowerCase() === 'true' ||
    process.env.OMO_DISABLE_POSTHOG === '1' ||
    process.env.OMO_DISABLE_POSTHOG?.toLowerCase() === 'true';
  if (disabled) return true;

  const telemetryVars = [
    process.env.LAZYKIMICODE_SEND_ANONYMOUS_TELEMETRY,
    process.env.OMO_KIMI_SEND_ANONYMOUS_TELEMETRY,
    process.env.OMO_SEND_ANONYMOUS_TELEMETRY,
  ];
  for (const value of telemetryVars) {
    if (value === undefined) continue;
    if (['0', 'false', 'no'].includes(value.toLowerCase())) return true;
  }
  return false;
}

/** Project directory override. */
export function getProjectDir(): string {
  return (
    process.env.LAZYKIMICODE_PROJECT ??
    process.env.OMO_KIMI_PROJECT ??
    process.cwd()
  );
}

/** Kimi Code home directory override. */
export function getKimiCodeHome(): string {
  return process.env.KIMI_CODE_HOME ?? path.join(os.homedir(), '.kimi-code');
}

/** Managed binary directory override. */
export function getBinDir(): string {
  const defaultHome = path.join(os.homedir(), '.kimi-code');
  const kimiCodeHome = getKimiCodeHome();
  return (
    getEnv('BIN_DIR') ??
    process.env.KIMI_LOCAL_BIN_DIR ??
    (kimiCodeHome === defaultHome
      ? path.join(os.homedir(), '.local', 'bin')
      : path.join(kimiCodeHome, 'bin'))
  );
}

/** Team-mode state directory. */
export function getTeamsDir(): string {
  return (
    process.env.LAZYKIMICODE_TEAMS_DIR ??
    process.env.OMO_TEAMS_DIR ??
    path.join(os.homedir(), '.omo', 'teams')
  );
}

/** User configuration directory. `.omo` is kept as the shared harness convention. */
export function getConfigDir(): string {
  return (
    process.env.LAZYKIMICODE_CONFIG_DIR ??
    process.env.OMO_KIMI_CONFIG_DIR ??
    path.join(os.homedir(), '.omo')
  );
}

/** Telemetry state file override. */
export function getStateFile(): string | undefined {
  return getEnv('STATE_FILE');
}

/** Telemetry state directory override. */
export function getStateDir(): string {
  return (
    getEnv('STATE_DIR') ??
    path.join(os.homedir(), '.local', 'share', 'lazykimicode')
  );
}
