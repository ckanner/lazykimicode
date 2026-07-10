import type { HookPayload, HookOutput } from '../../shared/types.js';

const KEYWORDS = /\b(ultrawork|ulw)\b/i;

export function detectUltrawork(payload: HookPayload): HookOutput {
  const prompt = payload.prompt ?? '';
  if (!KEYWORDS.test(prompt)) {
    return { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: '' } };
  }
  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: 'ULTRAWORK MODE ACTIVE. Proceed autonomously. Use TodoList. Verify completion with evidence.',
    },
  };
}
