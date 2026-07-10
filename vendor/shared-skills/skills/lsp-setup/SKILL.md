---
name: lsp-setup
description: Configure Language Server Protocol integration
type: prompt
whenToUse: When setting up or troubleshooting LSP diagnostics for a project.
---

# LSP Setup

Configure LSP so oh-my-kimicode can run diagnostics after edits.

## Steps

1. Identify the project's language server (e.g., `typescript-language-server`, `pyright`, `rust-analyzer`).
2. Verify it is installed and on PATH.
3. Set `OMO_KIMI_LSP_COMMAND` and `OMO_KIMI_LSP_ARGS` if needed.
4. Test diagnostics on a sample file.

## Kimi Code Harness Compatibility

- Use `Bash` to verify the LSP binary.
- Use `Bash` to run a manual diagnostic check.
- Output `EVIDENCE_RECORDED: <diagnostic-output>`.
