---
name: comment-checker
description: Explain and respond to automatic comment-checker feedback emitted after an edit-like PostToolUse hook.
type: prompt
whenToUse: When the model needs to understand why a comment-checker warning appeared after a Write or Edit, or how to resolve flagged TODO/FIXME/HACK/XXX/BUG markers.
---

# Comment Checker

The lazykimicode plugin registers a `PostToolUse` hook for successful `Write` and `Edit` calls.

When the hook finds unresolved `TODO`, `FIXME`, `HACK`, `XXX`, or `BUG` markers in the edited file, it injects a warning into the session context. The model should fix or explicitly explain the flagged marker before proceeding.

## Scope

- No MCP tool is exposed by this skill.
- Only `Write` and `Edit` tool calls are checked by the hook.
- The checker ignores markers inside string literals, template literals, and interpolation.
- Missing checker binaries emit no hook output so normal work can continue.

## Kimi Code Harness Compatibility

- Use `Read` to inspect the flagged file and confirm whether each marker is still unresolved.
- Use `Edit` to fix or remove flagged markers, or to add an explanatory comment next to a deliberately retained marker.
- Use `Agent(subagent_type="coder")` when the flagged marker is part of a larger refactor that should be handled by a dedicated implementer.
- Kimi has no thread-title concept; drop any `codex_app.set_thread_title` or thread-management instructions.
- Kimi does not support per-skill agent TOML files (e.g. `agents/openai.yaml`); do not copy or reference them.
