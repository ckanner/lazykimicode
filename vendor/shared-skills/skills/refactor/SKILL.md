---
name: refactor
description: Safe, incremental refactoring with tests
type: prompt
whenToUse: When improving code structure without changing external behavior.
---

# Refactor

Refactor incrementally. Preserve behavior. Use tests as safety rails.

## Steps

1. Identify the smell and the desired improvement.
2. Ensure existing tests cover the behavior.
3. Apply the refactor in small steps.
4. Run tests after each step.
5. Commit or summarize the change.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="plan")` to review the refactor plan.
- Use `Agent(subagent_type="coder")` for mechanical changes.
- Output `EVIDENCE_RECORDED: <test-output>`.
