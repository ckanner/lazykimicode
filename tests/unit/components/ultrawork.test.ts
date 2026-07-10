import { describe, it, expect } from 'vitest';
import { detectUltrawork } from '../../../src/components/ultrawork/detect.js';

describe('ultrawork', () => {
  it('injects context on keyword', () => {
    const out = detectUltrawork({ hookEventName: 'UserPromptSubmit', prompt: 'ulw add auth' });
    expect(out.hookSpecificOutput?.additionalContext).toContain('ULTRAWORK');
  });

  it('is silent otherwise', () => {
    const out = detectUltrawork({ hookEventName: 'UserPromptSubmit', prompt: 'hello' });
    expect(out.hookSpecificOutput?.additionalContext).toBe('');
  });
});
