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
      'OMO_KIMI_LSP_COMMAND',
      'LAZYKIMICODE_DISABLE_POSTHOG',
      'OMO_KIMI_DISABLE_POSTHOG',
      'OMO_DISABLE_POSTHOG',
      'LAZYKIMICODE_PROJECT',
      'OMO_KIMI_PROJECT',
      'LAZYKIMICODE_TEAMS_DIR',
      'OMO_TEAMS_DIR',
      'LAZYKIMICODE_CONFIG_DIR',
      'OMO_KIMI_CONFIG_DIR',
      'LAZYKIMICODE_STATE_DIR',
      'OMO_KIMI_STATE_DIR',
      'LAZYKIMICODE_SKIP_BOOTSTRAP',
      'OMO_KIMI_SKIP_BOOTSTRAP',
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

  it('prefers LAZYKIMICODE_* over OMO_KIMI_*', () => {
    process.env.LAZYKIMICODE_LSP_COMMAND = 'primary';
    process.env.OMO_KIMI_LSP_COMMAND = 'legacy';
    expect(getEnv('LSP_COMMAND')).toBe('primary');
  });

  it('falls back to OMO_KIMI_* when LAZYKIMICODE_* is unset', () => {
    process.env.OMO_KIMI_LSP_COMMAND = 'legacy';
    expect(getEnv('LSP_COMMAND')).toBe('legacy');
  });

  it('returns fallback when neither variable is set', () => {
    expect(getEnv('LSP_COMMAND', 'default')).toBe('default');
  });

  it('reads boolean env vars from either namespace', () => {
    process.env.LAZYKIMICODE_SKIP_BOOTSTRAP = '1';
    expect(getEnvBool('SKIP_BOOTSTRAP')).toBe(true);
    delete process.env.LAZYKIMICODE_SKIP_BOOTSTRAP;
    process.env.OMO_KIMI_SKIP_BOOTSTRAP = 'true';
    expect(getEnvBool('SKIP_BOOTSTRAP')).toBe(true);
  });

  it('detects telemetry disabled via LAZYKIMICODE_DISABLE_POSTHOG', () => {
    process.env.LAZYKIMICODE_DISABLE_POSTHOG = '1';
    expect(isTelemetryDisabled()).toBe(true);
  });

  it('detects telemetry disabled via OMO_DISABLE_POSTHOG', () => {
    process.env.OMO_DISABLE_POSTHOG = '1';
    expect(isTelemetryDisabled()).toBe(true);
  });

  it('detects telemetry disabled via SEND_ANONYMOUS_TELEMETRY=0', () => {
    process.env.LAZYKIMICODE_SEND_ANONYMOUS_TELEMETRY = '0';
    expect(isTelemetryDisabled()).toBe(true);
  });

  it('resolves project directory with fallback', () => {
    process.env.OMO_KIMI_PROJECT = '/legacy/project';
    expect(getProjectDir()).toBe('/legacy/project');
    process.env.LAZYKIMICODE_PROJECT = '/primary/project';
    expect(getProjectDir()).toBe('/primary/project');
  });

  it('resolves teams directory with fallback', () => {
    process.env.OMO_TEAMS_DIR = '/legacy/teams';
    expect(getTeamsDir()).toBe('/legacy/teams');
    process.env.LAZYKIMICODE_TEAMS_DIR = '/primary/teams';
    expect(getTeamsDir()).toBe('/primary/teams');
  });

  it('resolves config directory with fallback', () => {
    process.env.OMO_KIMI_CONFIG_DIR = '/legacy/config';
    expect(getConfigDir()).toBe('/legacy/config');
    process.env.LAZYKIMICODE_CONFIG_DIR = '/primary/config';
    expect(getConfigDir()).toBe('/primary/config');
  });

  it('resolves state directory with fallback', () => {
    process.env.OMO_KIMI_STATE_DIR = '/legacy/state';
    expect(getStateDir()).toBe('/legacy/state');
    process.env.LAZYKIMICODE_STATE_DIR = '/primary/state';
    expect(getStateDir()).toBe('/primary/state');
  });
});
