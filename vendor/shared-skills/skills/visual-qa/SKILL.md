---
name: visual-qa
description: Visual quality assurance and UI review
type: prompt
whenToUse: When reviewing UI screenshots, design fidelity, or visual output.
---

# Visual QA

Review visual output against requirements and design standards.

## Steps

1. Identify the expected visual state.
2. Inspect the provided image or rendered output.
3. Note deviations (layout, color, typography, spacing, responsiveness).
4. Suggest concrete fixes.

## Kimi Code Harness Compatibility

- Use `ReadMediaFile` for images.
- Use `Agent(subagent_type="explore")` to trace related UI code.
- Output `EVIDENCE_RECORDED: <screenshot-path-or-diff>`.
