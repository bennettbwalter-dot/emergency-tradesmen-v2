# Graphify Integration

Graphify (PyPI `graphifyy`, CLI `graphify`) is wired in as a **knowledge layer**:
it makes the AI chat smarter behind the scenes and gives admins a private graph
viewer. It is an **improvement layer on top of the existing RAG** — nothing in
the current vector search, emergency-brain, admin, auth or chat flow was removed.

## What users see vs. what admins see

| | Public users | Admin / developer |
|---|---|---|
| Graph viewer | ❌ never | ✅ `/admin/knowledge-graph` |
| Graph data / files | ❌ never | ✅ via gated endpoint only |
| Effect | Chat just feels smarter & more connected | Can inspect + regenerate the graph |

## How the chat got smarter (RAG layer)

The chat now consults a **domain knowledge graph** in addition to the existing
vector search + emergency-brain. The domain graph models trades, emergency
scenarios, safety actions, governing authorities and the relationships between
them — derived entirely from the **already-public** `data/master_knowledge_base.json`.

- `src/lib/graph-knowledge.ts` — loads `src/data/domain-graph.json` and exposes:
  - `graphDetectTrade(message)` — graph-based trade detection, used **only as a
    fallback** in `src/lib/chat-logic.ts` when every existing detector misses
    (purely additive — it can widen coverage but never override a match).
  - `buildRelatedHelpNote(trade, country)` — appends a short "you may also need
    a …" line to RAG answers so they feel more joined-up (e.g. a burst pipe →
    water restoration / drain specialist).
- Both call sites in `chat-logic.ts` are wrapped in `try/catch` and lazy-imported,
  so a missing or empty graph silently adds nothing and can never break the chat.
- The domain graph contains **0 code/file nodes** — only public domain info — so
  it is safe to ship in the browser bundle.

## Admin viewer (private)

- Page: `src/pages/admin/KnowledgeGraph.tsx`, route `/admin/knowledge-graph`,
  nav item "Knowledge Graph" — all under `AdminLayout` (admin-email gated).
- Data source: the **gated edge function** `supabase/functions/knowledge-graph`,
  which reuses the same `requireAdmin()` pattern as `brevo-status` (validates the
  Supabase JWT and checks the admin-email allowlist). `verify_jwt = true` in
  `supabase/config.toml` rejects unauthenticated callers at the platform edge too.
- The viewer is a self-contained canvas graph (no new dependencies): search,
  type filter (domain / code / all), zoom, pan, click-to-inspect node + its
  connections, plus the last-generated timestamp, source commit and node counts.

## Regeneration

```bash
npm run graph:build          # local, deterministic, no LLM, no network
```

This runs `scripts/graphify/build-graph.mjs`, which:

1. **Stages only an allowlist** of safe source (`src/`, `supabase/functions/`
   TS/JS) into a temp dir — secrets/.env/PII/node_modules are never copied, so
   they physically cannot be scanned.
2. Runs `graphify extract` + `graphify cluster-only --no-label` (tree-sitter AST +
   networkx clustering — **0 LLM tokens, no API keys, no network**).
3. **Secret-scans** the output and aborts if any credential-shaped string leaked.
4. Builds the domain graph from the public knowledge base.
5. Writes the artifacts (see below).

After regenerating, redeploy the admin endpoint:

```bash
supabase functions deploy knowledge-graph
```

Regeneration is a **developer command** (not a website button): a browser button
would need a privileged server runner with the CLI + filesystem, which this
serverless setup doesn't have. The admin page shows the command + last-generated
time so it's a one-liner, and it never runs automatically / never slows the site.

## Generated files

| File | Committed? | Purpose |
|---|---|---|
| `src/data/domain-graph.json` | ✅ | Chat RAG layer (public-safe domain graph) |
| `src/data/knowledge-graph-meta.json` | ✅ | Last-generated metadata for the admin page |
| `supabase/functions/knowledge-graph/graph.data.json` | ✅ | Full graph for the gated admin viewer |
| `graphify-out/{graph.html,graph.json,GRAPH_REPORT.md}` | ❌ (gitignored) | Raw Graphify reference artifacts for local viewing |

## Safety model

- **Secrets never scanned:** allowlist staging + a post-build secret scan that
  aborts on any leak. Audited output: no emails, JWTs, API keys or `.env` values.
- **Code graph is admin-only:** it lives only in the edge-function directory and
  is served only through `requireAdmin()`. It is **not** in `src/`, `public/` or
  the client bundle (verified against `dist/`).
- **Public bundle carries domain info only** — already public on the site.
- **No external LLM:** extraction is 100% local (tree-sitter + networkx).

## Assistant skill (`/graphify`)

`graphify install --project` registered the `/graphify` skill for Claude Code,
Codex, Hermes and Antigravity (skill docs under `.claude/`, `.codex/`, `.hermes/`,
`.agents/` + sections in `CLAUDE.md` / `AGENTS.md`). The optional PreToolUse
**hooks** it offers were intentionally **not kept** — they inject "always run
graphify first" reminders into every assistant turn, which is intrusive and
unnecessary for this integration. To enable them later:
`graphify install --project --platform claude` (then review `.claude/settings.json`).

## Tooling

- Installed via `uv tool install graphifyy` (v0.8.49). Binary: `~/.local/bin/graphify`.
- All dependencies are local (tree-sitter parsers, networkx, numpy, rapidfuzz).
