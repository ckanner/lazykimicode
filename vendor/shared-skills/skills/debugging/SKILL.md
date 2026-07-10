---
name: debugging
description: Systematic debugging workflow
type: prompt
whenToUse: When tests fail, behavior is unexpected, or errors occur.
---

# Debugging

Debug systematically. Do not guess; gather evidence, form hypotheses, and validate them.

## Steps

1. Reproduce the issue exactly.
2. Read relevant code, logs, and tests.
3. Formulate hypotheses and test each one minimally.
4. Fix the root cause, not symptoms.
5. Add or update a test that catches the bug.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="explore")` to trace code paths.
- Use `Bash` for reproduction commands.
- Output `EVIDENCE_RECORDED: <failing-test-output>`.
