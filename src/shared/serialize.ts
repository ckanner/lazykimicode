import type { HookOutput } from './types.js';

export function serializeHookOutput(output: HookOutput): string {
  return JSON.stringify(output);
}

export function writeHookOutput(output: HookOutput): void {
  process.stdout.write(serializeHookOutput(output) + '\n');
}

export function exitCodeForHookOutput(output: HookOutput): number {
  if (output.decision === 'block') return 2;
  if (output.hookSpecificOutput?.permissionDecision === 'deny') return 2;
  return 0;
}
