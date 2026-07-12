---
name: lsp-setup
description: "Configure a Language Server (LSP) for a specific language so lazykimicode diagnostics, go-to-definition, find-references, and rename work. Use when you need to: configure LSP, lsp setup, set up or install a language server, fix 'no LSP server configured' / 'server not installed', choose between servers (basedpyright vs pyright vs ty vs ruff), or wire OMO_KIMI_LSP_COMMAND / OMO_KIMI_LSP_ARGS. Covers typescript, python, go, rust, and any language with a stdio-speaking LSP server."
type: prompt
whenToUse: When setting up or troubleshooting LSP diagnostics for a project.
---

# LSP Setup

Configure the right Language Server for a project so the LSP MCP tools
(`lsp_diagnostics`, `lsp_goto_definition`, `lsp_find_references`) actually
work. This skill detects what a project needs, installs the server,
wires the lazykimicode harness, then verifies with a real roundtrip.

lazykimicode does **not** ship builtin language-server binaries. The LSP
client is wired entirely through `OMO_KIMI_LSP_COMMAND` and
`OMO_KIMI_LSP_ARGS`. You must install the server yourself and point the
harness at it.

---

## Common LSP server examples

| Language | Common server | Typical args |
|---|---|---|
| TypeScript / JavaScript | `typescript-language-server` | `--stdio` |
| Python | `pyright-langserver` (or `basedpyright-langserver`, `pylsp`, etc.) | `--stdio` |
| Go | `gopls` | (none, or `serve`) |
| Rust | `rust-analyzer` | (none) |

For other languages, use the same pattern: install a stdio-speaking LSP
server, set `OMO_KIMI_LSP_COMMAND` to its executable name, and add any
required args to `OMO_KIMI_LSP_ARGS`.

---

## WORKFLOW — detect → install → configure → verify

### 1. Detect

Scan the project to see which languages are present and whether each server is
installed and configured.

Inspect manually:

```bash
# List language files in the project
find <projectDir> -type f \( -name '*.ts' -o -name '*.py' -o -name '*.go' -o -name '*.rs' \) | head -50

# Check whether a server is installed
command -v typescript-language-server
command -v pyright-langserver
command -v gopls
command -v rust-analyzer
```

For each detected language report: the executable it needs on `PATH`, whether
that executable is installed, an install hint, and whether a project config
already references it.

### 2. Install

Install the language server for the project's language using the project's
preferred package manager or the server's official install instructions. Then
confirm the executable resolves:

```bash
command -v <server-executable>   # e.g. typescript-language-server, gopls, rust-analyzer
```

### 3. Configure

lazykimicode wires the LSP client through environment variables. Set these
variables to point the harness at the server and pass any required args.

Environment variables:

- `OMO_KIMI_LSP_COMMAND` — the language server executable (e.g.
  `typescript-language-server`, `pyright-langserver`, `rust-analyzer`).
- `OMO_KIMI_LSP_ARGS` — space-separated arguments passed to the executable
  (e.g. `--stdio` for servers that need it).

Examples:

```bash
# TypeScript / JavaScript
export OMO_KIMI_LSP_COMMAND=typescript-language-server
export OMO_KIMI_LSP_ARGS="--stdio"

# Python with pyright
export OMO_KIMI_LSP_COMMAND=pyright-langserver
export OMO_KIMI_LSP_ARGS="--stdio"

# Go
export OMO_KIMI_LSP_COMMAND=gopls

# Rust
export OMO_KIMI_LSP_COMMAND=rust-analyzer
```

If the project uses a per-project config file (`.omo/lsp.json` or
`.kimi-code/mcp.json`), prefer project-local wiring over exported env vars.
Project entries win over user entries; explicit env vars win over defaults.

### 4. Verify

Run a real diagnostics roundtrip against a source file. This spawns the server,
opens the file, requests diagnostics, and reports `OK`/`FAIL`.

Verify through the lazykimicode LSP MCP tools directly:

- Call `lsp_status` to check harness status.
- Call `lsp_diagnostics` with `{"file": "<path/to/file.ext>"}` to request diagnostics for a file.

`OK` = the server started and answered. `FAIL: language server not installed`
= go back to step 2. Other `FAIL` text carries the server/startup error.
`SKIP` = the engine source could not be located; check that `OMO_KIMI_LSP_COMMAND`
is set and the binary is on `PATH`, then call the LSP tool again.

---

## Helper scripts (not shipped)

LazyCodex original distributions may include helper scripts such as
`scripts/detect-lsp.ts`, `scripts/verify-lsp.ts`, and
`scripts/lsp-server-table.ts`. The Kimi Code CLI build of lazykimicode does
**not** ship them; use the equivalent `Bash` and LSP MCP tool commands shown
above.

---

## Kimi Code Harness Compatibility

- Use `Bash` to verify the LSP binary, install packages, and run manual checks.
- Use `Read` to inspect project config files and source files before diagnosing.
- Use `Write` / `Edit` to create or update project config files
  (`.omo/lsp.json`, `.kimi-code/mcp.json`, shell profile exports, etc.).
- Use `Agent(prompt=..., subagent_type="coder"|"explore"|"plan")` when you need a
  subordinate reasoning pass for a language-specific install or troubleshooting
  investigation.
- Use `AgentSwarm` with a prompt template referencing `lsp-setup` when you need
  parallel independent detection across multiple languages or candidate servers.
- Kimi has no thread-title concept; drop any `codex_app.set_thread_title` or
  thread-management instructions.
- Kimi does not support per-skill agent TOML files (e.g. `agents/openai.yaml`);
  do not copy or reference them.
- Kimi Code CLI has no built-in browser tool. Browser-dependent install steps
  (e.g., downloading a server release asset) should use the `kimi-webbridge`
  skill if available, or be handed off to the user with exact instructions.
