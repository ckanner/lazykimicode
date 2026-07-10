import { describe, it, expect } from 'vitest';
import { runBootstrap } from '../../../src/components/codegraph/bootstrap.js';

describe('codegraph', () => {
  it('returns bootstrap context', () => {
    const out = runBootstrap({ hookEventName: 'SessionStart' });
    expect(out.hookSpecificOutput?.hookEventName).toBe('SessionStart');
    expect(out.hookSpecificOutput?.additionalContext).toContain('CodeGraph');
  });
});
