---
name: programming
description: General programming assistance and implementation
type: prompt
whenToUse: For everyday coding tasks that do not fit a specialized skill.
---

# Programming

Write clean, correct, tested code following project conventions.

## Rules

1. Read relevant files and AGENTS.md first.
2. Prefer small, focused changes.
3. Add or update tests for new behavior.
4. Run lint and tests before finishing.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="coder")` for large implementations.
- Use `Agent(subagent_type="explore")` to understand existing code.
- Output `EVIDENCE_RECORDED: <test-output>`.
