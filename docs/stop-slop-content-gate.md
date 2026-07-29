# Stop-Slop Content Gate

Use `C:\Users\Nick\.codex\skills\stop-slop\SKILL.md` for every blog article and every visible website copy change before publishing or deploying.

This gate applies to:

- Blog posts in Supabase and `optimized-blogs`.
- Landing page headlines, hero copy, CTAs, pricing copy, FAQ answers, service descriptions, directory text, form copy, modal copy, email/outreach text, and SEO descriptions.
- UK and US variants separately, after regional terminology checks.

## Required Pass

Before finalising copy:

1. Remove throat-clearing openers and filler.
2. Remove formulaic AI structures, including forced binary contrasts, rhetorical setups, dramatic fragments, and narrator-from-a-distance phrasing.
3. Use active voice with a clear human actor.
4. Replace vague claims with specific practical wording.
5. Prefer `you` where the reader needs direct action.
6. Vary sentence length without punchy one-line endings.
7. Remove em dashes from public copy.
8. Keep social media posts, SEO implementation notes, and regional-lock checks out of public blog bodies.

## Scoring Gate

Score the public copy against the `stop-slop` rubric:

- Directness
- Rhythm
- Trust
- Authenticity
- Density

If the total is below `35/50`, revise before publishing. For daily blogs, record only the pass/fail result in internal notes. Do not add the score to the public post body.

Run the automated public-copy audit before publishing content changes:

```bash
npm run content:stop-slop
```

The audit catches obvious issues such as em dashes, common AI filler phrases, and internal publishing sections accidentally added to public blog bodies. Manual review with the `stop-slop` skill still controls final quality.

## Blog-Specific Rule

Public blog content must use the current HTML magazine pattern and stop at the reader-facing CTA. Internal publishing notes belong in a separate notes file, not in `posts.content`.
