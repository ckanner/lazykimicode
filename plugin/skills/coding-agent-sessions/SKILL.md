---
name: coding-agent-sessions
description: "MUST USE when asked to find, read, list, search, inspect, fetch, export, or reconstruct coding-agent sessions across Codex, Claude Code/Desktop, OpenCode, Senpi/pi, OpenClaw, Factory Droid, Amp, Gemini/Kimi/Qwen CLIs, Codebuff, Roo/Kilo/Cline, Kodu, Cursor CLI, Aider, or unknown local agent logs. Covers transcripts, session IDs, rollout JSONL, state SQLite, Claude projects/pre-compact histories, OpenCode messages/parts, child/subagent linkage, cwd/model/time/token filters, archives, and cost clues. Expands fuzzy recall into parallel query lanes and first probes known stores so absent platforms are skipped cheaply. Triggers: coding agent sessions, Codex/Claude/OpenCode/Senpi/pi/OpenClaw/Droid/Amp/Kodu/Cursor/Aider sessions, transcript search, session history, session ID, read transcript, token usage, subagent sessions, what did I do yesterday, did we already do this."
type: prompt
whenToUse: "When asked to find, read, list, search, inspect, fetch, export, or reconstruct local coding-agent sessions across any coding-agent product, including memory-recall questions like \"what did I work on yesterday\" or \"did we already migrate X\"."
---

# Coding Agent Sessions

Find local coding-agent sessions across agent products before answering from memory. Probe the known platform stores with `Bash`, `Read`, and `Grep`, then read the selected session or raw file when you need exact evidence.

This distribution does **not** include the bundled `scripts/find-agent-sessions.py`
finder or `references/{codex,claude,senpi,opencode,all-platforms}.md` reference
files. Use the equivalent `Bash`/`Grep`/`Read` workflow below.

## PHASE 0 - PLATFORM ROUTER

1. **Identify the platform from the user's request.** Common platforms and their typical local stores:

   | Platform | Common local stores |
   |---|---|
   | Codex / OpenAI Codex CLI | `~/.codex/state_*.sqlite`, rollout JSONL under `~/.codex/`, archived rollout files |
   | Claude Code / Claude Desktop histories | `~/.claude/projects/<proj>/<session-id>/`, `~/.claude/transcripts/`, `~/.claude/pre-compact-session-histories/` |
   | Senpi / pi coding-agent logs | project-local or `~/.senpi/` logs (varies by version) |
   | OpenCode / oh-my-openagent | `~/.opencode/`, `~/.local/share/opencode/`, `opencode.db`, `storage/session/`, `messages/`, `parts/` |
   | OpenClaw, Droid, Amp, Gemini, Kimi, Qwen, Codebuff, Roo/Kilo/Cline, Kodu, Cursor CLI, Aider, Kiro, Goose, Hermes, Crush, Zed | product-specific directories under `~/.config/`, `~/.local/share/`, or the project workspace |

2. **Run a broad search first unless the user gave an exact file path.** For fuzzy recall, derive 3-6 short query lanes before searching: product/tool aliases, repo/package names, exact error text, issue/PR/session IDs, English/Korean phrasing, and likely verbs such as `fix`, `review`, `plan`, `deploy`, or `merge`. Run the lanes in parallel with `Grep` or `Bash`+`grep`/`rg` against the known stores.

   Example searches:

   ```bash
   # List candidate session files in a store
   find ~/.codex ~/.claude ~/.opencode -type f \( -name '*.jsonl' -o -name '*.json' -o -name '*.sqlite' -o -name '*.db' \) 2>/dev/null | head -50

   # Grep for a term across likely transcript roots
   grep -Ril "deploy" ~/.claude/transcripts ~/.opencode 2>/dev/null | head -20
   rg -i "proxy|deploy" ~/.codex ~/.claude ~/.opencode 2>/dev/null | head -50
   ```

   Use `python` or `python3` with the `sqlite3` module for SQLite stores (e.g.
   Codex `state_*.sqlite`, OpenCode `opencode.db`) when the CLI tool is not
   available:

   ```bash
   python3 - <<'PY'
   import sqlite3, glob, os
   for path in glob.glob(os.path.expanduser('~/.codex/state_*.sqlite')):
       print(path)
       con = sqlite3.connect(path)
       for row in con.execute("SELECT name FROM sqlite_master WHERE type='table'"):
           print('  table:', row[0])
   PY
   ```

3. **Use explorer-style parallel lanes when one query batch is not enough.**

   If scope is broad (multi-month, many repos/platforms, or a vague "what happened with X"), split independent searches by names/errors, repos/cwds, platforms/models, and time windows. Use `AgentSwarm` (with a prompt template containing `coding-agent-sessions`) or sequential `Agent` calls for these lanes when delegation is useful; otherwise run the `Bash`/`Grep` calls in parallel. Merge candidates by `id`/`path`, then read the most likely sessions.

4. **Read details from search results before ad hoc digging.** Once you have candidate paths, use `Read` to inspect the raw transcript/index file, or `Grep` with context to pull the first/last user prompt and key events.

5. **Verify by opening raw transcripts for claims.** Normalized summaries are useful, but the raw `path` remains the source of truth.

## Output Contract

When reporting findings, include at least these fields for each candidate:

| Field | Meaning |
|---|---|
| `platform` | Registered platform key such as `codex`, `claude`, `opencode`, `openclaw`, `droid`, `amp`, `kodu`, `cursor-cli`, `aider`, `roo-code`, `kilo-code`, `kilo-cli`, or `kiro` |
| `id` | Session ID or stable file-derived ID |
| `path` | Raw transcript/index file |
| `cwd` | Working directory when recoverable |
| `created_at`, `updated_at` | ISO-like timestamps when recoverable |
| `provider`, `model` | Model metadata when recoverable |
| `first_user_message` | First user prompt preview (for subagents: task description + delegated prompt) |
| `last_user_message` | Last user prompt preview when recoverable |
| `usage` | Token/cost clues when present in the platform log |
| `parent_id` | Parent session/thread ID when this is a subagent or child session, else `null` |
| `agent` | Subagent label (Claude `agentType`, Codex `nickname (role)`, OpenCode agent name) |
| `subagent_count` | Number of child sessions spawned by this session |
| `match_reasons` | Search-only array explaining which field/content matched each query |

## Filters

Apply these filters using standard tools:

| Filter | How to apply |
|---|---|
| `--platform` | Restrict `find`/`grep` roots to the platform's known store |
| `--root` | Add an extra root directory to scan |
| `--from`, `--to` | Use `find ... -newermt` or filter by file mtime/JSON timestamp |
| `--cwd` | `grep -i <cwd-substring>` over recovered paths/content |
| `--model` | `grep -i <model-substring>` over content |
| `--limit` | Pipe through `head -N` |
| `--query` | Run multiple `grep`/`rg` terms and merge results |
| `--include-subagents` | Include child session files as standalone results |

When no platform is named, search every known store in parallel. Each optional
platform first probes fixed, known transcript roots and returns immediately
when the product has no local store, so broad default searches stay cheap.

For OpenCode, prefer `opencode db path` plus direct SQLite queries first, then
`opencode session list --format json` as a fallback. Avoid heavy `messages/`
or `parts/` scans during normal list/search, and only fall back to file joins
when the OpenCode DB/CLI is unavailable or explicit `--root` values request a
nonstandard store.

Usage-only sources such as Copilot OTEL, Mux, Antigravity tokscale cache rows,
Synthetic provider retagging, and Cursor IDE usage CSV are excluded from default
transcript search because they do not reconstruct user prompts.

## Subagent / Child Sessions

Search returns main sessions only by default, each annotated with
`subagent_count`. Reading a main session reveals its whole delegation tree by
inspecting child session files. Reading a child session directly returns that
child's own events.

| Platform | Where children live | Linkage |
|---|---|---|
| Claude Code | `projects/<proj>/<session-id>/subagents/agent-*.jsonl` (Task tool) and `.../subagents/workflows/wf_*/agent-*.jsonl` (Workflow) | Directory name = parent session ID; `agent-*.meta.json` holds `agentType` + task description |
| Codex | Regular threads in `state_*.sqlite` + own rollout JSONL | `thread_spawn_edges` table and `threads.source` / rollout `session_meta.payload.source.subagent.thread_spawn` |
| OpenCode | Regular sessions in `opencode.db` / `storage/session/` | `session.parent_id` column / `parentID` field; `agent` column names the subagent |

When the user asks whether some specific work was ever done, search with
`--include-subagents` — delegated work often lives only in child transcripts,
not in the main session. Workflow `journal.jsonl` files are orchestration logs,
not sessions.

## Codex Notes

For Codex sessions, search the SQLite state and rollout JSONL directly:

```bash
# List tables in a Codex state database
sqlite3 ~/.codex/state_<id>.sqlite ".tables"

# Find recent rollout files
find ~/.codex -name '*.jsonl' -type f -mtime -7 2>/dev/null | head -20

# Search Codex content for a term
rg -i "deploy" ~/.codex 2>/dev/null | head -50
```

## Kimi Code Harness Compatibility

This skill is a local evidence-gathering workflow, not a coding delegation skill. Map its operations to Kimi Code CLI tools as follows:

- **Finder execution** — The bundled `scripts/find-agent-sessions.py` is **not** shipped in this distribution. Use `Bash` to run `find`/`grep`/`rg`/`sqlite3`, `Grep` for content searches inside known transcript roots, and `Read` for individual files.
- **Parallel query lanes / broad explorer searches** — Use `AgentSwarm` with a prompt template containing `coding-agent-sessions`, or sequential `Agent(...)` calls, to run independent name/error, repo/cwd, platform/model, and time-window lanes in parallel. Merge results by `id`/`path` before reading details.
- **Reading transcripts, references, and raw files** — Use `Read` for local files. Use `Grep` for content searches inside known transcript roots.
- **Browser work** — Kimi Code CLI has no built-in browser tool. Use the `kimi-webbridge` skill if available, otherwise use `FetchURL`, or ask the user for the needed page content.
- **Dropped Codex runtime concepts** — `codex_app.*` APIs, `multi_agent_v2`, thread titles, `set_thread_title`, and `lazycodex-gate-reviewer` agent types do not exist in Kimi Code CLI; this skill uses `Bash`/`Grep`/`Read` for the search and `Agent`/`AgentSwarm` only for parallel lane delegation.
- **No per-skill agent TOML** — Kimi Code CLI does not support per-skill agent configuration files; ignore any vendor agent YAML/TOML files referenced by LazyCodex skills.

## Troubleshooting

| Problem | Fix |
|---|---|
| Missing Codex sessions | Set `CODEX_HOME` or pass `--root /path/to/.codex`. |
| Missing OpenCode sessions | Pass the data dir that contains `messages/` and `parts/`, often `~/.opencode` or `~/.local/share/opencode`. |
| Missing Claude sessions | Search `~/.claude/projects`, `~/.claude/transcripts`, and `~/.claude/pre-compact-session-histories`; use `--root` for nonstandard config dirs. |
| Missing optional platform sessions | Check the product docs for the exact local store. For project-local tools such as Aider, pass `--root /path/to/workspace` if the repo is outside the bounded default roots. |
| Date filter misses local sessions | Timestamps are compared as UTC instants when parseable; otherwise file mtime is used. |
| Search is slow | Narrow with platform roots or date/cwd filters. Optional stores are probed before parsing; avoid passing your whole home as `--root` unless you really want every bounded project-local scan. |

## Activation

Use this skill for any request to find, read, or inspect a local coding-agent session, regardless of product name — including memory-recall questions ("what did I work on a few days ago", "did we already migrate X", "when did I fix Y"). If the user only says "that session where we did X", do not rely on one literal query: expand to multiple discriminative terms first, add `--include-subagents` when the work may have been delegated, then narrow by `--platform`, `cwd`, `model`, and time (`--from 7d` for "a few days ago"). Read the most likely raw files with `Read` or pull key snippets with `Grep` before summarizing.
