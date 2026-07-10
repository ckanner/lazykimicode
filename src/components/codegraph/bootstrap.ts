import type { HookPayload, HookOutput } from '../../shared/types.js';

export function runBootstrap(_payload: HookPayload): HookOutput {
  return {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: 'CodeGraph initialized in background. Use codegraph MCP tools for structural queries.',
    },
  };
}

export function runPostToolUse(_payload: HookPayload): HookOutput {
  return {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '',
    },
  };
}
