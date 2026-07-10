---
name: lcx-contribute-bug-fix
description: Contribute a bug fix following LazyCodex/OmO conventions
type: prompt
whenToUse: When preparing a bug fix contribution for an upstream project.
---

# Contribute Bug Fix

Prepare a clean bug fix contribution with reproduction, fix, test, and documentation.

## Steps

1. Reproduce the bug and capture evidence.
2. Write a failing test or minimal reproduction.
3. Fix the minimal root cause.
4. Ensure tests pass and lint is clean.
5. Summarize the change for a PR description.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="explore")` to understand the upstream codebase.
- Use `Agent(subagent_type="coder")` to implement the fix.
- Output `EVIDENCE_RECORDED: <test-output>`.
