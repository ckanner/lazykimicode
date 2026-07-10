---
name: lcx-doctor
description: Health check and diagnostics for the Oh My KimiCode installation
type: prompt
whenToUse: When something seems wrong with hooks, MCP servers, or plugin installation.
---

# Oh My KimiCode Doctor

Run diagnostics on the oh-my-kimicode installation and report issues.

## Checks

1. `~/.kimi-code/config.toml` contains oh-my-kimicode hooks.
2. Plugin cache directory exists and has expected binaries.
3. MCP server binaries are executable/symlinked.
4. `AGENTS.md` and `.omo/rules/` are readable.
5. `sg` (ast-grep) is available if needed.

## Kimi Code Harness Compatibility

- Use `Bash` for file and command checks.
- Use `Read` to inspect config files.
- Output a structured health report.
