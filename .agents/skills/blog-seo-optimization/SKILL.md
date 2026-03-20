---
name: blog-seo-optimization
description: End-to-end SEO workflow for auditing and fixing all blog content across UK/global and US domains, including keyword mapping, on-page structure, internal links, localization, canonical/domain placement, and AI Overview optimization. Use when asked to improve rankings, fix blog quality, clean overlap/duplication, standardize blog metadata/structure, or execute a full-corpus blog SEO remediation pass.
---

# Blog SEO Optimization

Run this workflow to optimize an entire blog corpus, not only recent posts.

## Quick Start (Mandatory)

1. Build or obtain a full post inventory.
2. Run the automated audit script first.
3. Prioritize fixes by severity and business impact.
4. Apply post-level rewrites and internal link corrections.
5. Re-run the audit before declaring completion.

### Recommended inventory source for this repo

If available, use `all_posts_audit.json` as the baseline corpus input.

### Automated audit command

```bash
python .agents/skills/blog-seo-optimization/scripts/audit_blog_corpus.py \
  --input all_posts_audit.json \
  --min-word-count 900 \
  --public-dir public \
  --out-json tmp/blog-seo-audit-report.json \
  --out-csv tmp/blog-seo-audit-report.csv \
  --autofix-output tmp/all_posts_audit.autofixed.json
```

This produces a machine-readable report to drive fixes across all posts.
The autofix output applies safe extension corrections (`.wehp` → `.webp`) for blog content image links.

### Script validation command

```bash
python -m unittest discover -s .agents/skills/blog-seo-optimization/scripts -p "test_*.py"
```

## Domain and Localization Guardrails

Enforce hard routing rules:

- UK/global content must remain on `https://emergencytradesmen.net`.
- US content must remain on `https://emergencycontractors.net`.
- Wrong-domain posts require canonical + internal-link corrections.
- Localization must match market intent (terminology, spelling, regulations, CTA language).

Never ship mixed localization in a single market-specific article unless explicitly writing a comparison piece.

## SEO Audit Workflow (All Posts)

### Step 1: Build Master Audit Sheet

For every post capture:

- URL, slug, publish date
- Country intent (`UK`, `US`, or shared/global)
- Primary keyword + 3-8 secondary entities
- Search intent (`informational`, `commercial`, `transactional`, `local service`)
- Word count
- Heading structure quality (H1/H2/H3)
- Title/meta quality
- Internal links in/out
- External authority references
- Duplicate cluster ID

Use `references/audit-template.md` as the required schema.

### Step 2: Score and Prioritize

Score each post using severity levels:

- `critical`: domain/canonical mismatch, heavy cannibalization
- `high`: missing keyword coverage, thin content, poor heading structure
- `medium`: weak internal linking, weak intro matching intent
- `low`: polish opportunities

Fix `critical` and `high` items first.

### Step 3: Resolve Duplication and Overlap

Cluster overlapping topics by trade + emergency intent + location modifier.

For each cluster:

- Choose canonical winner URL.
- Merge unique value from overlapping posts into winner.
- Redirect/deindex deprecated duplicates when appropriate.
- Update internal links to point at canonical winner.

### Step 4: Rewrite for Intent + Depth

For each post ensure:

- Intent-aligned answer appears in first 120 words.
- Clear H1 with logical H2/H3 progression.
- Practical guidance (steps, risks, costs, response times).
- Country-specific regulation/safety context where relevant.
- FAQ section targeting snippet-style queries.
- Contextual CTA to relevant service/trade pages.

Avoid filler; prioritize utility and clarity.

### Step 5: On-Page SEO Corrections

For each post optimize:

- Title tag (specific, unique, keyword-forward)
- Meta description (intent + locality + value)
- Slug (short, descriptive, market-consistent)
- Image alt text (descriptive + contextual)
- Schema (Article/FAQ/Breadcrumb when supported)
- Image paths (broken local links, extension typos like `.wehp`)

### Step 6: Internal Linking Clusters

Minimum linking rules:

- Link each post to at least one relevant service/trade page.
- Add 2-5 related blog links (hub-and-spoke where possible).
- Use natural anchor variation (not repetitive exact-match spam).
- Ensure reciprocal links from cornerstone pages back to supporting posts.

## AI Overview and Featured Snippet Optimization

Structure content for extraction:

- Question-led subheadings
- Direct answer blocks near top
- Numbered procedures and concise tables
- Verifiable regulation/safety statements
- Compact FAQ blocks for high-intent questions

## Publishing, Date Order, and Consistency Checks

Before final sign-off:

1. Verify publication dates and ordering are correct.
2. Standardize formatting patterns across all posts.
3. Confirm no orphan posts and no broken internal links.
4. Confirm canonical targets and domain placement.
5. Validate slug changes and corresponding redirects.
6. Re-run the audit script and compare severity deltas.

## Output Requirements

Deliver all of the following:

1. Audit summary (corpus size, severity counts, overlap clusters)
2. Per-post fix log (keywords, structure, links, localization, slug/meta)
3. Domain compliance report (UK vs US placement + canonical status)
4. Internal linking map (hub/spoke + service-page coverage)
5. Remaining backlog of high-impact opportunities

Do not mark complete if any discovered posts remain unaudited.

## Resources

- `scripts/audit_blog_corpus.py`: automated full-corpus audit generator.
- `scripts/test_audit_blog_corpus.py`: regression tests for detection and scoring logic.
- `references/audit-template.md`: scoring schema and definition-of-done.
- `references/localization-playbook.md`: UK/US language and regulation cues.
