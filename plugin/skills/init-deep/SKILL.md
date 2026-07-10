---
name: init-deep
description: Deep project initialization and discovery for Kimi Code CLI
type: prompt
whenToUse: When starting work on a new or unfamiliar codebase and you need a thorough project overview.
---

# Init Deep

Perform a comprehensive project discovery. Read the README, package manifest, build config, test setup, AGENTS.md, and directory structure. Identify the tech stack, conventions, entry points, and any existing rules.

## Steps

1. Read `README.md`, `package.json`, `AGENTS.md`, and config files.
2. List top-level directories and note their responsibilities.
3. Identify build, test, lint, and CI commands.
4. Summarize architecture, conventions, and current state.
5. Create or update `.omo/rules/project.md` with discovered conventions.

## Kimi Code Harness Compatibility

- Use `Agent(prompt=..., subagent_type="explore")` for broad codebase scans.
- Use `AgentSwarm` to scan multiple areas in parallel.
- Use `TodoList` to track discovery steps.
- When finished, output `EVIDENCE_RECORDED: .omo/rules/project.md`.
