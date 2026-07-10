---
name: ultimate-browsing
description: "Escalation skill for blocked or hard-to-reach web access — load it when a normal browse/fetch is blocked (WAF, 403, Cloudflare, JS-only render, login-gated, or a platform a generic fetcher cannot read). Tiered router: TIER 1 insane-search (WebSearch/FetchURL/Agent escalation for blocked extraction, media metadata, and public APIs); TIER 1.5 agent-reach (platform-native readers for Chinese and social platforms via subagents); TIER 2 Chrome stealth (real interaction via external browser bridge — requires user setup or the kimi-webbridge skill). Triggers: blocked site, bypass bot detection, cloudflare/WAF bypass, scrape, stealth browser, import cookies, fill form, screenshot, play youtube, xiaohongshu, douyin, weibo, bilibili, v2ex, wechat article, podcast transcript. NOT for simple searches (use web-search) or plain fetches (use webfetch)."
type: prompt
whenToUse: When up-to-date external information is needed and normal web access is blocked, gated, or insufficient.
---

# Ultimate Browsing

Escalation web access for tasks a normal browse or fetch cannot complete. Reach for this skill the moment a page is blocked (WAF / 403 / Cloudflare), needs JS rendering, hides behind a login, or lives on a platform a generic fetcher cannot read. Escalate only when the cheaper tier cannot do the job:

**Tier 1 — insane-search** (headless extraction + WAF bypass) -> **Tier 1.5 — agent-reach** (platform-native APIs, esp. Chinese platforms) -> **Tier 2 — Chrome stealth** (real interaction via external browser bridge).

## PHASE 0 — ROUTE FIRST (MANDATORY)

```
User request
  |
  +- extract text/data from a URL --------------------- TIER 1  insane-search
  +- URL blocked / 403 / Cloudflare / WAF ------------- TIER 1  insane-search
  +- YouTube/Vimeo/TikTok subtitles or metadata ------- TIER 1  insane-search (yt-dlp via Agent)
  +- read an article / blog / Reddit / HN / arXiv ----- TIER 1  insane-search
  |
  +- Chinese platform (xhs/douyin/weibo/bilibili/v2ex/wechat)  TIER 1.5 agent-reach
  +- podcast transcript / stock forum ----------------- TIER 1.5 agent-reach
  +- Twitter feed / LinkedIn profile / GitHub via CLI - TIER 1.5 agent-reach
  |
  +- Tier 1/1.5 returned empty or partial ------------- TIER 2  Chrome stealth
  +- click / fill form / scroll / interact ------------ TIER 2  Chrome stealth
  +- screenshot / render / play video ----------------- TIER 2  Chrome stealth
  +- login session across pages / inject cookies ------ TIER 2  Chrome stealth
  +- test web app / QA / dogfood ---------------------- TIER 2  Chrome stealth
  |
  +- simple search query ------------------------------ NOT this skill (use web-search)
```

Read the matching strategy section below before acting.

## Tier 1 — insane-search (headless extraction)

**When**: content extraction, blocked-URL bypass, media metadata — no browser UI needed.
**Why first**: ~10x faster than a browser; handles most "fetch this blocked page" requests via `FetchURL`, `WebSearch`, official public APIs, mobile URL transforms, and subagent exploration. Kimi Code CLI has no built-in WAF-bypass engine, so use the grid of Kimi tools below.

```bash
# Core path — try FetchURL first:
FetchURL "https://example.com/blocked-page"

# If blocked, escalate to Agent explore to find mirrors/cached versions/API endpoints:
Agent(prompt="Find accessible mirrors, cached copies, or official public APIs for https://example.com/blocked-page. Return direct URLs and a summary of each source.", subagent_type="explore")

# YouTube subtitles / metadata (no browser) — requires yt-dlp installed locally:
yt-dlp --write-sub --write-auto-sub --sub-lang "en,ko" --skip-download -o "/tmp/%(id)s" "<URL>"

# Reddit / HN / Bluesky / arXiv etc. use official public endpoints — see the Phase 0 official-API index below.
```

### Phase 0 official-API index (common platforms)

| Platform | Public endpoint / trick |
|---|---|
| Reddit | Add `.json` to any Reddit URL, e.g. `https://www.reddit.com/r/foo/comments/....json` |
| Hacker News | Firebase API: `https://hacker-news.firebaseio.com/v0/item/<id>.json` |
| arXiv | `https://export.arxiv.org/api/query?id_list=<id>` |
| Bluesky | `https://public.api.bsky.app/xrpc/app.bsky.feed.getPosts?uris=...` |
| Twitter/X syndication | `https://cdn.syndication.twimg.com/tweet-result?id=<tweet_id>&lang=en` (unofficial, may break) |
| Wikipedia | `https://en.wikipedia.org/api/rest_v1/page/summary/<title>` |

### Escalate to Tier 1.5 or Tier 2 when
- The target is a Chinese / social platform with a native reader -> Tier 1.5.
- Tier 1 returns empty/partial, or the page needs JS interaction, a screenshot, a persistent login, or media playback -> Tier 2.

## Tier 1.5 — agent-reach (platform-native readers)

**When**: the target is a platform with a first-class API/CLI that beats generic fetching — especially Chinese platforms that stealth browsers still cannot reach cleanly. Several channels are zero-config; others need a one-time auth you supply via environment variables if you have access.

| Category | Platforms | Entry |
|---|---|---|
| social | xhs (Xiaohongshu), douyin, weibo, bilibili, V2EX, Reddit, Twitter/X | use `Agent(subagent_type="explore")` to find the current best public API/reader for the platform |
| web | Jina Reader, WeChat articles, RSS | `FetchURL` with `https://r.jina.ai/http://...` or direct RSS feed |
| video | YouTube, Bilibili, podcast transcripts, Douyin video | `Agent` wrapping `yt-dlp` or platform API docs |
| career | LinkedIn | `Agent(subagent_type="explore")` for public profile data |
| dev | GitHub | `gh` CLI via `Bash`, or `FetchURL` to GitHub REST/GraphQL API |
| search | Exa AI | `Agent(subagent_type="explore")` or API call if key is available |

```bash
# Weibo via Jina Reader:
FetchURL "https://r.jina.ai/https://weibo.com/<uid>/<pid>"

# V2EX public API:
FetchURL "https://www.v2ex.com/api/topics/hot.json"

# GitHub CLI (requires gh auth):
gh api repos/<owner>/<repo>/issues

# Bilibili metadata (requires yt-dlp installed):
yt-dlp --dump-json "<bilibili-url>"
```

Routing table, per-platform auth (set `TWITTER_*` env vars, `gh auth login`, a transcription key — only if you have access), rate-limit notes, and known version quirks should be discovered by an `Agent(subagent_type="explore")` before use.

## Tier 2 — Chrome stealth (real interaction)

**When**: real interaction is needed (clicks, forms, screenshots, video, persistent login), or Tier 1/1.5 failed.

**Kimi Code CLI has no built-in browser tool.** Tier 2 requires an external browser bridge. Options:
1. If the `kimi-webbridge` skill is available in this workspace, load it and follow its instructions.
2. Otherwise, ask the user to provide the required output (screenshot, page source after login, etc.) or to set up a local browser bridge that exposes CDP or screenshots.

If a local CloakBrowser / agent-browser setup exists (not provided by Kimi), drive it via `Bash`:

```bash
# 1. Launch CloakBrowser with CDP on :9242 (user-managed install).
# 2. CloakBrowser launches tabless — open the first tab via CDP before any agent-browser command:
curl -s -X PUT "http://127.0.0.1:9242/json/new?https://example.com"
# 3. Drive it with agent-browser over CDP:
agent-browser --cdp 9242 snapshot -i
agent-browser --cdp 9242 click @e3
agent-browser --cdp 9242 screenshot out.png
agent-browser --cdp 9242 close
```

### Cookie login (cross-platform)

If a local `scripts/extract_cookies.py` exists, it reads cookies from a local Chromium-family or Firefox-family browser and optionally injects them into the running CDP session. This is user-managed tooling, not provided by Kimi.

```bash
# Extract cookies to a file:
mkdir -p ~/.local/state/omo-cookies
python3 scripts/extract_cookies.py --browser chrome --domain youtube.com --output ~/.local/state/omo-cookies/youtube.cookies.json
# Extract and inject into the running CDP session:
python3 scripts/extract_cookies.py --browser chrome --domain youtube.com --inject --cdp 9242
```

Cookie export files are written with owner-only `0600` permissions. Do not place live auth cookies in shared temp directories or commit them to a repo. Cookie injection sends values to CDP over stdin rather than argv. Cookies apply on next navigation — reload after injecting. Google services use fingerprint-bound tokens that may not transfer across browser profiles.

## Reference docs

| Concept | Where to find it |
|---|---|
| Tier-1 engine harness (R1-R7, Phase 0 API index, no-site-name rule) | See "Tier 1 — insane-search" above; the original Codex engine module is not available in Kimi. |
| Tier-1.5 routing table, platform auth, per-category guides | See "Tier 1.5 — agent-reach" above; use `Agent(subagent_type="explore")` for platform-specific current APIs. |
| Tier-2 CloakBrowser + agent-browser install, CDP flow, version pins, cookie login | See "Tier 2 — Chrome stealth" above; these are user-managed external tools. |

## Environment variables

```bash
CLOAK_CDP_PORT=9242              # CloakBrowser CDP port (default 9242) — only if using external browser bridge
AGENT_BROWSER_USER_AGENT="..."   # override UA to hide HeadlessChrome — only if using external browser bridge
AGENT_BROWSER_HEADED=1           # show the browser window — only if using external browser bridge
# agent-reach auth: set the channel-specific env vars from each tool's docs only if you have access
```

## Anti-patterns

- Do NOT launch Chrome stealth for plain text extraction — use Tier 1.
- Do NOT use Tier 2 before exhausting Tier 1 and Tier 1.5.
- Do NOT run agent-browser before creating the first tab via `curl -X PUT .../json/new` — CloakBrowser launches tabless.
- Do NOT use vanilla Chrome when stealth is needed — always CloakBrowser (if available).
- Do NOT forget to `close` the session when done.
- Do NOT inject cookies without reloading the page.
- Do NOT hardcode site domains/selectors into skill files — runtime hints only.

## Kimi Code Harness Compatibility

- Use `WebSearch` and `FetchURL` tools for Tier 1.
- Use `Agent(subagent_type="explore")` for platform discovery, mirror finding, and API routing (Tier 1.5).
- Use `AgentSwarm` with a prompt template containing `ultimate-browsing` for parallel research across multiple sources.
- For real browser interaction (Tier 2), use the `kimi-webbridge` skill if available; otherwise ask the user.
- Use `Write` / `Edit` to record evidence; output `EVIDENCE_RECORDED: <url>` for key facts.
