---
name: git-master
description: Advanced git operations and branch management
type: prompt
whenToUse: When you need to manipulate branches, commits, history, or perform code review via git.
---

# Git Master

Use git precisely. Avoid destructive operations unless explicitly requested. Keep history clean and meaningful.

## Rules

1. Check current branch and status before acting.
2. Prefer small, focused commits.
3. Use `git diff` and `git log` to understand context.
4. For complex history edits, use `git rebase -i` and explain the plan.

## Kimi Code Harness Compatibility

- Use `Bash` for git commands.
- Use `Agent(subagent_type="coder")` for large refactors across commits.
- Output `EVIDENCE_RECORDED: git log --oneline`.
