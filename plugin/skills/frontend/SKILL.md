---
name: frontend
description: Frontend development guidance and best practices
type: prompt
whenToUse: When working on UI components, styling, or client-side code.
---

# Frontend

Follow frontend best practices: component clarity, accessibility, responsive design, and test coverage.

## Rules

1. Prefer framework-native patterns over custom solutions.
2. Keep components small and focused.
3. Ensure accessibility basics (labels, keyboard nav, contrast).
4. Write or update tests for UI logic.

## Kimi Code Harness Compatibility

- Use `Agent(subagent_type="coder")` for implementation.
- Use `Bash` to run frontend tests and linters.
- Output `EVIDENCE_RECORDED: <test-output>`.
