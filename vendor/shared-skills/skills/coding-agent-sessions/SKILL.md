---
name: coding-agent-sessions
description: Manage focused coding subagent sessions
type: prompt
whenToUse: When a task should be delegated to a dedicated coder subagent with a narrow scope.
---

# Coding Agent Sessions

Spawn focused coder subagents for isolated implementation tasks. Each session should have a clear deliverable and return evidence.

## Rules

1. Scope each session to one deliverable.
2. Provide context, constraints, and acceptance criteria.
3. Review the subagent's output before integrating.
4. Run tests before finishing.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="coder")` for implementation.
- Use `TodoList` to track active sessions.
- Require `EVIDENCE_RECORDED:` in each subagent's final message.
