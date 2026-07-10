---
name: start-work
description: Begin a new work unit with Boulder tracking
type: prompt
whenToUse: When starting a non-trivial task that should be tracked until completion.
---

# Start Work

Begin a tracked work unit. Create a Boulder plan so session stop can be guarded until complete.

## Steps

1. Clarify the goal and success criteria.
2. Create `.omo/boulder.json` with `active_work_id`, `works`, and `completed: false`.
3. Produce a plan with `TodoList`.
4. Work through the plan, updating evidence.
5. Mark the work complete and remove/complete Boulder state.

## Kimi Code Harness Compatibility

- Use `TodoList` to track steps.
- Use `Agent(subagent_type="coder")` for implementation.
- Output `EVIDENCE_RECORDED: <path>` after each cycle.
