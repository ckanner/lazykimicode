---
name: lsp
description: Use when the model needs language-server diagnostics, definitions, references, symbols, or rename safety checks in the current workspace.
type: prompt
whenToUse: When you need LSP-powered analysis and the lazykimicode LSP MCP is available.
---

# LSP

Call the LSP MCP tools listed below through the tool interface. In Kimi Code CLI they are exposed via the plugin's LSP MCP server and may be prefixed as `mcp__<server>__<tool>` depending on harness routing.

## Tools

- `lsp_status`: daemon / LSP server status.
- `lsp_diagnostics`: diagnostics for a file. Prefer checking errors after edits.
- `lsp_goto_definition`: locate a symbol definition from file, line, and character.
- `lsp_find_references`: find usages of a symbol across the workspace.
- `lsp_symbols`: inspect document symbols for a file.
- `lsp_prepare_rename`: check whether a rename is valid at a position.
- `lsp_rename`: apply a language-server workspace edit for a rename.

## Config

Configure the LSP server via environment variables:

```bash
export LAZYKIMICODE_LSP_COMMAND=typescript-language-server
export LAZYKIMICODE_LSP_ARGS="--stdio"
```

If the project uses a per-project config, store it under `.lazykimicode/lsp.json`.

Use `lsp_status` first when diagnostics report that no LSP server is configured.

## Kimi Code Harness Compatibility

- Use `lsp_status` to verify the daemon or stateless LSP server is reachable before calling other LSP tools.
- Use `lsp_diagnostics` after edits to confirm no new errors were introduced.
- Use `lsp_goto_definition` and `lsp_find_references` when the question requires semantic navigation rather than text search.
- Use `lsp_prepare_rename` before `lsp_rename` to validate a rename is safe.
- Use `Read` to inspect source files before passing file paths to LSP tools.
- Use `Agent(subagent_type="coder"|"explore"|"plan")` for complex multi-language refactoring or language-server troubleshooting.
- Kimi has no thread-title concept; drop any `codex_app.set_thread_title` or thread-management instructions.
- Kimi does not support per-skill agent TOML files (e.g. `agents/openai.yaml`); do not copy or reference them.
