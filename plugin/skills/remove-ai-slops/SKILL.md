---
name: remove-ai-slops
description: Clean up low-quality AI-generated code artifacts
type: prompt
whenToUse: When the codebase contains placeholder comments, redundant code, or AI slop.
---

# Remove AI Slops

Identify and remove low-quality AI artifacts: placeholder comments, dead code, redundant wrappers, and unnecessary verbosity.

## Steps

1. Scan for markers like `TODO`, `FIXME`, `// AI`, `// generated`, and overly verbose comments.
2. Remove or replace placeholders with real implementation.
3. Simplify redundant code.
4. Run tests and lint.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="explore")` to scan the codebase.
- Use `Edit` for cleanup.
- Output `EVIDENCE_RECORDED: <lint-and-test-output>`.
