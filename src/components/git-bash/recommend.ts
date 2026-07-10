import os from 'node:os';
import type { HookPayload, HookOutput } from '../../shared/types.js';

export function recommendGitBash(_payload: HookPayload, platform?: string): HookOutput {
  if ((platform ?? os.platform()) !== 'win32') {
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', additionalContext: '' } };
  }
  return {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      additionalContext: 'On Windows, prefer the git_bash MCP server over Bash for shell commands.',
    },
  };
}
