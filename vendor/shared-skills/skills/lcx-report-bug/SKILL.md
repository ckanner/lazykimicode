---
name: lcx-report-bug
description: Help the user file a high-quality bug report
type: prompt
whenToUse: When the user wants to report a bug in oh-my-kimicode or another project.
---

# Report Bug

Gather the information needed for a high-quality bug report.

## Required Fields

1. Summary: one-line description.
2. Reproduction steps: numbered, minimal.
3. Expected vs actual behavior.
4. Environment: OS, Node version, Kimi Code version, oh-my-kimicode version.
5. Logs or error output.

## Kimi Code Harness Compatibility

- Use `Bash` to collect environment info.
- Use `Read` to attach relevant logs.
- Output a Markdown bug report ready to paste.
