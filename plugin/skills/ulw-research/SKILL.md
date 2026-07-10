---
name: ulw-research
description: Autonomous research loop for open-ended questions
type: prompt
whenToUse: When a question requires iterative research and synthesis.
---

# ULW Research

Research iteratively. Each cycle produces findings and identifies the next question.

## Steps

1. Define the research question.
2. Search and read sources.
3. Summarize findings and gaps.
4. Decide whether to continue or synthesize.
5. Deliver a final report with citations.

## Kimi Code Harness Compatibility

- Use `AgentSwarm` for parallel source checks.
- Use `WebSearch` and `FetchURL`.
- Output `EVIDENCE_RECORDED: <urls>`.
