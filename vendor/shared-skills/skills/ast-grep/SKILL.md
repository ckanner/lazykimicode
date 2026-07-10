---
name: ast-grep
description: "Use ast-grep (sg) for AST-aware code search and rewrite across 25 languages. Trigger for structural code matching or deterministic codemods: find every function/call/class/import shaped like X, rewrite console.log to logger.info, strip `as any`, migrate require() to import, find empty catch blocks or missing await, and scan/apply YAML rules. Prefer this over rg/grep when the target is syntax shape rather than text; use rg for string contents, comments, filenames, or regex-style byte searches."
type: prompt
whenToUse: "When the user's question is about code structure, not bytes: find/rewrite functions, calls, classes, imports, control flow; run codemods across many files; apply YAML lint rules; migrate patterns like require()→import, Optional[X]→X | None, console.log→logger.info; or detect empty catch blocks and missing awaits."
---

# ast-grep

`sg` (also installed as `ast-grep`) is an **AST-aware search and rewrite tool** across 25 languages. It treats your pattern as code, parses it the same way it parses your project, and matches structurally. It is the right tool whenever your question depends on **code shape** rather than text bytes.

This skill documents the ast-grep workflow. The original LazyCodex version also ships a Python helper (`scripts/ast_grep_helper.py`) and reference guides under `references/`; those artifacts are not vendored here, so use the direct `sg` commands shown below. The core workflow — validate, dry-run, then apply — remains the same.

---

## When to use this skill

Use it whenever the user's question is about **code structure**, not bytes:

- "Find every function that takes a `Request` parameter."
- "Rewrite every `console.log(x)` to `logger.info(x)`."
- "Strip every `as any` cast."
- "Replace `require(...)` with `import` across the repo."
- "Find empty catch blocks."
- "Migrate `Optional[X]` to `X | None`."
- "Apply this codemod across these 200 files."
- "Run our YAML lint rules and surface violations."

Switch to plain `grep` / `rg` when the question is text-shaped (string literal contents, comments, license headers, file names, cross-language regex). When in doubt, ask: "does the answer depend on the language's syntax tree, or just on the file's bytes?" If the former, ast-grep. If the latter, grep.

---

## Three things the agent must internalize

### 1. ast-grep is NOT regex

The wildcards are `$VAR` (one AST node) and `$$$` (zero or more nodes). Regex syntax fails silently:

| You wrote | What ast-grep saw | What you wanted |
|---|---|---|
| `foo\|bar` | bitwise-or of `foo` and `bar` | run two separate searches |
| `.*foo` | not parseable | `$$$ foo` (if `$$$` is a list of nodes) or use `rg` |
| `\w+` | not parseable | `$VAR` to capture any identifier |
| `[a-z]` | character class, not parseable | switch to `rg` |

If you have access to the original LazyCodex `references/pitfalls.md`, consult §1 for the full anti-pattern table. In practice, prefer `sg run --debug-query=ast` to inspect how a pattern parses.

### 2. Patterns must be valid code

The pattern itself must parse. `def $FN($$$):` fails because the trailing `:` makes it incomplete; use `def $FN($$$)`. `function $NAME` without params/body fails; use `function $NAME($$$) { $$$ }`.

### 3. `--update-all` and `--json` are mutually exclusive (silently)

This is the single biggest gotcha when scripting. `sg run -p P -r R --json --update-all` returns the JSON but **does not mutate files**. To both preview AND apply, run **two passes**:

```bash
sg run -p P -r R --json=compact .   # pass 1: see what would change
sg run -p P -r R --update-all .     # pass 2: actually apply
```

---

## Direct `sg` use

The minimal idioms:

```bash
# Search
sg run -p 'console.log($MSG)' --lang ts src/

# Search with JSON for scripting
sg run -p 'console.log($MSG)' --lang ts --json=compact src/ | jq '.[] | .file'

# Rewrite, dry-run
sg run -p 'console.log($MSG)' -r 'logger.info($MSG)' --lang ts --json=compact src/

# Rewrite, apply
sg run -p 'console.log($MSG)' -r 'logger.info($MSG)' --lang ts --update-all src/

# Pattern from stdin (great for ad-hoc experiments)
echo 'console.log("hi")' | sg run -p 'console.log($MSG)' --lang js --stdin

# Debug a pattern that returns 0 matches
sg run -p '<your pattern>' --lang <lang> --debug-query=ast --stdin <<< '<sample-code>'

# Run YAML rules
sg scan src/

# Inline YAML rule (one-off)
sg scan --inline-rules '
id: no-todo
language: TypeScript
severity: warning
rule: { pattern: TODO }' src/
```

When using `sg` directly in a shell, **always single-quote patterns** so `$VAR` is not expanded by the shell.

---

## Decision tree — what to use, when

```
USER asks for "find/rewrite/codemod"
│
├─ structural pattern (function shape, call, class, import, control flow)
│  └→ ast-grep (this skill)
│
├─ text pattern (regex, alternation, character classes, file names)
│  └→ rg / grep
│
├─ semantic question (what variable does this refer to? does this throw?)
│  └→ LSP tools, TypeScript compiler, Pyright, Semgrep with type inference
│
└─ multiple repos / federated search
   └→ a search engine + then ast-grep / rg / LSP per-repo
```

If the user says "find all" or "every", default to ast-grep when the target is shaped (function, class, call, import, statement). Default to rg when the target is text (string content, comment, license header, file name, identifier substring).

---

## Always run dry-run first when rewriting

A bad pattern silently rewrites the wrong thing. The flow is:

1. Search to confirm matches: `sg run -p '<pattern>' --lang X .`
2. Dry-run rewrite: `sg run -p '<pattern>' -r '<rewrite>' --lang X . --json=compact` (no `--update-all`)
3. Inspect the dry-run summary: number of matches, files affected, the per-location preview.
4. If wrong: refine pattern, go back to step 1.
5. If right: `sg run -p '<pattern>' -r '<rewrite>' --lang X . --update-all`.

Never apply a rewrite that you have not first dry-run.

---

## When `sg` returns 0 matches but you know the code is there

In priority order:

1. **Inspect the parsed pattern**: `sg run -p '<pattern>' --lang <lang> --debug-query=ast --stdin <<< '<sample>'`. If it shows `ERROR` nodes, the pattern is malformed.
2. **Check `--lang`** — `sg` infers from extension; if you pass a `.tsx` file with `--lang ts` (not `tsx`), JSX won't parse.
3. **Check the AST of the target file**: `sg run -p '$_' --lang <lang> --debug-query=cst path/to/file | head -40` — find the `kind` you're trying to match.
4. **Try the playground**: <https://ast-grep.github.io/playground.html> — paste code + pattern, see what's happening.

Do not blindly retry with variations. Each failure has a reason; surface it.

---

## When to use YAML rules vs inline `-p` patterns

**Use inline `-p`** when:
- One-off ad-hoc query.
- The pattern is simple (no constraints, no fix template).
- You're exploring.

**Use YAML rules** (file under `rules/`, run via `sg scan`) when:
- The pattern is reused (lint rule, codemod that runs in CI).
- You need `constraints`, `transform`, complex `inside`/`has`, or composite logic.
- You want auto-fix (`fix:` field).
- You want to test the rule (snapshot tests via `sg test`).

---

## Output discipline

- `sg run --json=compact` produces an array of match objects: `{ file, range: {start, end}, text, replacement?, lines, language, ... }`. Pipe through `jq` for further processing.
- Without `--json`, `sg` produces human-readable colored output suitable for terminals.

When summarizing for the user, **always include the count of files affected**, not just the count of matches. Users care about blast radius.

---

## Invariants (do not break)

- **Dry-run before applying.** Never run `sg run -r ... --update-all` without first inspecting the matches.
- **Two-pass writes.** When using `sg` directly to both preview and apply, run two invocations — `--json` ignores `--update-all`.
- **Single-quote patterns in shell.** `'$VAR'` not `"$VAR"`. The shell expands `$VAR` to the empty string in double quotes, breaking the pattern.
- **Pattern is code, not regex.** When the pattern would need `|`, `.*`, `\w`, or `[a-z]`, switch to `rg` instead. Don't try to force ast-grep into a regex shape.
- **`--lang` is required for stdin.** When piping with `--stdin`, set `--lang` explicitly; `sg` cannot infer from extension.
- **Linux: prefer `ast-grep` over `sg`** because `sg` collides with `setgroups`. If you call the binary directly, alias it: `alias sg=ast-grep`.

---

## Kimi Code Harness Compatibility

- Use `Bash` to run all `sg` / `ast-grep` commands and to pipe results through `jq`.
- Use `Write` / `Edit` for any follow-up manual fixes that ast-grep cannot express as a structural rewrite.
- Use `Agent(prompt=..., subagent_type="coder"|"explore"|"plan")` for complex multi-language codemods, large-scale rule design, or when you want a dedicated reasoning pass before touching files.
- Use `AgentSwarm` with a prompt template containing `ast-grep` when you need parallel independent searches across several languages, directories, or rule sets.
- Kimi has no thread-title concept; drop any `codex_app.set_thread_title` instructions.
- Kimi has no per-skill agent TOML files; drop any `agents/openai.yaml` or similar Codex agent YAML references.
- Kimi Code CLI has no built-in browser. If a workflow step requires the browser (for example, inspecting the ast-grep playground), use the `kimi-webbridge` skill if available, or hand the exact URL and steps to the user.
- This vendored copy does not include the LazyCodex helper script (`scripts/ast_grep_helper.py`) or reference guides (`references/`). Use direct `sg` commands as shown above.
