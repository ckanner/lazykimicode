---
name: ultimate-browsing
description: Research and gather information from the web
type: prompt
whenToUse: When up-to-date external information is needed.
---

# Ultimate Browsing

Search the web for current, authoritative information. Summarize findings with sources.

## Rules

1. Use specific queries.
2. Prefer official docs and primary sources.
3. Cite URLs for claims.
4. Do not rely on memory for time-sensitive facts.

## Kimi Code Harness Compatibility

- Use `WebSearch` and `FetchURL` tools.
- Use `Agent(subagent_type="explore")` for parallel research.
- Output `EVIDENCE_RECORDED: <url>` for key facts.
