---
name: review-work
description: Review completed work before integration
type: prompt
whenToUse: Before claiming a task complete or merging changes.
---

# Review Work

Review the current changes against requirements, conventions, and quality.

## Checklist

1. Requirements met?
2. Tests added/updated and passing?
3. Lint and typecheck clean?
4. No unresolved TODO/FIXME?
5. Documentation updated?
6. Diff is minimal and focused?

## Kimi Code Harness Compatibility

- Use `Bash` to run verification commands.
- Use `Agent(subagent_type="plan")` for architectural review.
- Output `EVIDENCE_RECORDED: <verification-output>`.
