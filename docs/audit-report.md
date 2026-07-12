# lazykimicode Audit Report

> **Scope:** Final verification that the `OMO`/`OmO` legacy brand has been fully removed from code, docs, configuration, and CI, and that the implementation is consistent with the LazyKimiCode product plan.
>
> **Date:** 2026-07-13
>
> **Verification baseline:** `pnpm run lint && pnpm run typecheck && pnpm test && pnpm run build` — green.

---

## 1. Wire protocol

Kimi Code CLI communicates with hook scripts through a local stdio contract (sometimes called the "wire protocol" in this codebase):

- The CLI writes a single JSON object to the hook script's **stdin**.
- Field names use **snake_case**, e.g. `hook_event_name`, `tool_name`, `tool_input`, `tool_output`, `session_id`, `subagent_type`, `stop_hook_active`, `prompt`, `response`.
- Only `UserPromptSubmit`, `PreToolUse`, and `Stop` can block.
- Exit code `0` = allow; exit code `2` = block; other non-zero = fail-open.
- The script may print a JSON object to **stdout**. Recognized fields:
  - `message` (top-level context to append)
  - `hookSpecificOutput.message`
  - `hookSpecificOutput.permissionDecision` / `permissionDecisionReason`
- For blocking events the reason is read from **stderr**.

`lazykimicode` implements this correctly via `src/shared/payload.ts` (snake→camel normalization) and `src/shared/serialize.ts` (output builder). No protocol changes are required.

Reference: [Hooks | Kimi Code CLI Docs](https://moonshotai.github.io/kimi-code/en/customization/hooks)

---

## 2. Environment variables and branding

All harness configuration uses the `LAZYKIMICODE_*` namespace. Legacy `OMO_KIMI_*` and `OMO_*` fallbacks have been removed.

- `src/shared/env.ts` is the single source of truth for env var reads.
- No production code reads `process.env.OMO_*` or `process.env.OMO_KIMI_*` directly.
- `src/components/ulw-loop/steer.ts` only recognizes the `LAZYKIMICODE_ULW_LOOP_STEER:` steering marker.
- `scripts/sync-hooks.mjs` generates `(LazyKimiCode ${VERSION})` status messages.
- `scripts/build.mjs` and `.github/workflows/release.yml` use only `LAZYKIMICODE_POSTHOG_API_KEY`.
- `plugin/skills/` is clean of `OMO`/`OmO`/`OMO_` references; `scripts/sync-skills.mjs` still transforms upstream `vendor/shared-skills/` copies during sync.

---

## 3. Docs ↔ code consistency

Verified items:

- Component list and hook events in `README.md`, `AGENTS.md`, `docs/capabilities.md` match `src/install/hook-defs.ts`.
- MCP tool names match between `plugin/kimi.plugin.json`, source servers, and `docs/capabilities.md`.
- Skills list in `docs/capabilities.md` matches `plugin/skills/`.
- Test count claims are updated to the current baseline.
- Version numbers are consistent (`0.1.3` in `package.json`, `src/shared/version.ts`, `plugin/kimi.plugin.json`).

---

## 4. Missing features from the plan

The four gaps called out by earlier audits are implemented and tested:

| Gap | Evidence |
|---|---|
| `teammode` subcommands | `src/components/teammode/scripts/team.ts`, `tests/unit/components/teammode.test.ts` |
| `lsp-daemon` split | `src/components/lsp/daemon.ts`, `src/components/lsp/mcp-server.ts`, `tests/unit/components/lsp-daemon.test.ts`, `tests/unit/components/lsp-mcp-server.test.ts` |
| Skill / MCP tool name alignment | `tests/unit/skills/mcp-alignment.test.ts` |
| `create-pr-body.mjs` | `plugin/skills/lcx-contribute-bug-fix/scripts/create-pr-body.mjs`, `tests/unit/skills/create-pr-body.test.ts` |

No missing features remain in these four areas.

---

## 5. Known limitations

All three previously listed limitations are resolved in code:

1. **teammode file locking** — `archive()` and `deleteTeam()` use `withLock()`.
2. **comment-checker multi-line/template-literal detection** — `findStringRanges()` handles multi-line template literals, `${...}` interpolation, escaped backticks, and nested strings.
3. **LSP quoted-space args** — `parseLspArgs()` respects single/double quotes and backslash escapes.

No stale limitation notes remain in code or docs.

---

## 6. Remaining work

None. The rebrand is complete, the wire protocol is aligned, all audited features are implemented and tested, and CI is green.
