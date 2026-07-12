import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getEnv,
  getEnvBool,
  isTelemetryDisabled,
  getProjectDir,
  getTeamsDir,
  getConfigDir,
  getStateDir,
} from '../../../src/shared/env.js';

describe('env helpers', () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const key of [
      'LAZYKIMICODE_LSP_COMMAND',
      'LAZYKIMICODE_DISABLE_POSTHOG',
      'LAZYKIMICODE_SEND_ANONYMOUS_TELEMETRY',
      'LAZYKIMICODE_PROJECT',
      'LAZYKIMICODE_TEAMS_DIR',
      'LAZYKIMICODE_CONFIG_DIR',
      'LAZYKIMICODE_STATE_DIR',
      'LAZYKIMICODE_SKIP_BOOTSTRAP',
    ]) {
      saved[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('reads LAZYKIMICODE_* env vars', () => {
    process.env.LAZYKIMICODE_LSP_COMMAND = 'primary';
    expect(getEnv('LSP_COMMAND')).toBe('primary');
  });

  it('returns fallback when variable is unset', () => {
    expect(getEnv('LSP_COMMAND', 'default')).toBe('default');
  });

  it('reads boolean env vars from LAZYKIMICODE namespace', () => {
    process.env.LAZYKIMICODE_SKIP_BOOTSTRAP = '1';
    expect(getEnvBool('SKIP_BOOTSTRAP')).toBe(true);
    delete process.env.LAZYKIMICODE_SKIP_BOOTSTRAP;
    process.env.LAZYKIMICODE_SKIP_BOOTSTRAP = 'true';
    expect(getEnvBool('SKIP_BOOTSTRAP')).toBe(true);
  });

  it('detects telemetry disabled via LAZYKIMICODE_DISABLE_POSTHOG', () => {
    process.env.LAZYKIMICODE_DISABLE_POSTHOG = '1';
    expect(isTelemetryDisabled()).toBe(true);
  });

  it('detects telemetry disabled via SEND_ANONYMOUS_TELEMETRY=0', () => {
    process.env.LAZYKIMICODE_SEND_ANONYMOUS_TELEMETRY = '0';
    expect(isTelemetryDisabled()).toBe(true);
  });

  it('resolves project directory with LAZYKIMICODE_PROJECT', () => {
    process.env.LAZYKIMICODE_PROJECT = '/primary/project';
    expect(getProjectDir()).toBe('/primary/project');
  });

  it('resolves teams directory with LAZYKIMICODE_TEAMS_DIR', () => {
    process.env.LAZYKIMICODE_TEAMS_DIR = '/primary/teams';
    expect(getTeamsDir()).toBe('/primary/teams');
  });

  it('resolves config directory with LAZYKIMICODE_CONFIG_DIR', () => {
    process.env.LAZYKIMICODE_CONFIG_DIR = '/primary/config';
    expect(getConfigDir()).toBe('/primary/config');
  });

  it('resolves state directory with LAZYKIMICODE_STATE_DIR', () => {
    process.env.LAZYKIMICODE_STATE_DIR = '/primary/state';
    expect(getStateDir()).toBe('/primary/state');
  });
});
