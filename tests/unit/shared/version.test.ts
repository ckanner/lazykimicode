import { describe, it, expect } from 'vitest';
import { VERSION } from '../../../src/shared/version.js';
import pkg from '../../../package.json' with { type: 'json' };

describe('VERSION', () => {
  it('matches package.json version', () => {
    expect(VERSION).toBe(pkg.version);
  });
});
