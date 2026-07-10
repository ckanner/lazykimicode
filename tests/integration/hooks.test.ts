import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import type { HookOutput } from '../../src/shared/types.js';

const PROJECT_ROOT = path.resolve(process.cwd());
const PLUGIN_DIR = path.join(PROJECT_ROOT, 'plugin');

describe('hook execution integration', () => {
  beforeAll(() => {
    if (!fs.existsSync(path.join(PLUGIN_DIR, 'components', 'bootstrap', 'dist', 'cli.mjs'))) {
      execFileSync('pnpm', ['run', 'build'], { cwd: PROJECT_ROOT, stdio: 'inherit' });
    }
  });

  function runHook(component: string, event: string, payload?: Record<string, unknown>): HookOutput {
    const cli = path.join(PLUGIN_DIR, 'components', component, 'dist', 'cli.mjs');
    const input = payload ? JSON.stringify(payload) : '';
    const stdout = execFileSync('node', [cli, 'hook', event], {
      cwd: PROJECT_ROOT,
      input,
      encoding: 'utf-8',
      env: {
        ...process.env,
        OMO_KIMI_DISABLE_POSTHOG: '1',
        OMO_KIMI_STATE_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'omo-hooks-')),
      },
    });
    const lines = stdout.trim().split('\n');
    const json = lines[lines.length - 1];
    return JSON.parse(json) as HookOutput;
  }

  it('bootstrap session-start returns SessionStart context', () => {
    const out = runHook('bootstrap', 'session-start', { hookEventName: 'SessionStart' });
    expect(out.hookSpecificOutput?.hookEventName).toBe('SessionStart');
    expect(out.hookSpecificOutput?.additionalContext).toContain('OmO');
  });

  it('git-bash pre-tool-use recommends git_bash on Windows', () => {
    const out = runHook('git-bash', 'pre-tool-use', { hookEventName: 'PreToolUse', toolName: 'Bash' });
    if (os.platform() === 'win32') {
      expect(out.hookSpecificOutput?.additionalContext).toContain('git_bash');
    } else {
      expect(out.hookSpecificOutput?.additionalContext).toBe('');
    }
  });

  it('telemetry session-start returns empty context when disabled', () => {
    const out = runHook('telemetry', 'session-start', { hookEventName: 'SessionStart' });
    expect(out.hookSpecificOutput?.hookEventName).toBe('SessionStart');
    expect(out.hookSpecificOutput?.additionalContext).toBe('');
  });

  it('ultrawork detects ultrawork keyword', () => {
    const out = runHook('ultrawork', 'user-prompt-submit', { hookEventName: 'UserPromptSubmit', prompt: 'ultrawork plan my feature' });
    expect(out.hookSpecificOutput?.additionalContext?.toLowerCase()).toContain('ultrawork');
  });

  it('rules discovers rules files', () => {
    const out = runHook('rules', 'session-start', { hookEventName: 'SessionStart' });
    expect(out.hookSpecificOutput?.hookEventName).toBe('SessionStart');
  });
});
