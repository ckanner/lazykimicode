---
name: ulw-plan
description: Produce a detailed execution plan for an ultrawork task
type: prompt
whenToUse: When the user wants a structured plan before autonomous execution.
---

# ULW Plan

Break the user's request into a concrete, ordered execution plan. Each step must be small enough to verify and must include a success criterion.

## Rules

1. Ask only for information that is strictly missing.
2. Produce a numbered plan with dependencies.
3. Identify risks and mitigation.
4. Do not implement; only plan.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="plan")` for review.
- Use `TodoList` to present the plan.
- Output `PLAN_APPROVED:` when the user confirms.
