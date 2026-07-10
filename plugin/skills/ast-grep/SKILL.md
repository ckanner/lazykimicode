---
name: ast-grep
description: Structural search and rewrite using ast-grep
type: prompt
whenToUse: When you need pattern-based code search or safe multi-file rewrites.
---

# AST Grep

Use `ast-grep` (`sg`) for structural code search and rewrite. Prefer AST patterns over regex when manipulating code.

## Steps

1. Inspect the target pattern with `sg scan --pattern '...'`.
2. For rewrites, preview with `sg scan --rewrite '...'` first.
3. Apply changes only after confirming the preview.
4. Run tests and lint after rewriting.

## Kimi Code Harness Compatibility

- Use `Bash` to run `sg` commands.
- Use `Write`/`Edit` for any follow-up manual fixes.
- Output `EVIDENCE_RECORDED: <test-output>` after verification.
