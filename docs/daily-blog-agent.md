# Daily Blog Agent Contract

This guide controls the recurring blog-writing agent for `emergencytradesmen.net` and `emergencycontractors.net`.

## Job

Write and prepare daily emergency trade blog posts without changing the existing blog layout.

Each run should create one UK post and one US post unless Nick gives a different topic list. The UK post is for `emergencytradesmen.net`. The US post is for `emergencycontractors.net`.

## Layout Rules

- Keep the current blog layout from `src/pages/BlogPostPage.tsx` and `src/pages/BlogPage.tsx`.
- Do not redesign blog pages, cards, headers, typography, spacing, section order, or CTA placement.
- Add new content through the existing `posts` Supabase records and existing Markdown/HTML article body flow.
- Preserve the same outer blog structure, including title, excerpt, metadata, article body, ads, CTA, product block, related posts, and sidebar.
- Do not shorten the blog content. Use the full article from start to finish.
- Do not remove important sections.
- Generate and assign one colour-block hero image for each new post unless Nick explicitly says not to include images.
- Save new generated assets under `public/images/blog/generated/` and set `cover_image` to the matching public `/images/blog/generated/...` path.
- Match the existing colour-block style already used in `public/images/blog/generated`: simple graphic, strong regional/topic colour, short readable title text, no photo-realistic scene.

## Writing Rules

- Read and apply `docs/stop-slop-content-gate.md` and `C:\Users\Nick\.codex\skills\stop-slop\SKILL.md` before inserting or updating any blog post.
- Aim for about 1,200 words per post.
- Write at a 6th to 8th grade reading level.
- Use short sentences and active voice.
- Keep the tone calm, practical, trustworthy, and lightly witty.
- Open with a relatable emergency scene in two or three short paragraphs.
- Move fast into safety-first advice.
- Include a "Repair vs. Replace" or "Save Your Wallet" angle in every post.
- Keep social media copy, SEO checklist notes, and regional-lock verification out of the public post body. Save them as internal publishing notes only.
- Apply the `stop-slop` skill before publishing: cut filler, avoid formulaic AI phrasing, remove weak adverbs, avoid em dashes, and put the reader in the room.

## Regional Lock

Use UK terms only in UK posts:

- Boiler
- Gas Engineer
- Tradesmen
- Callout
- Consumer Unit
- RCD/MCB
- Stopcock
- Loft
- Damp
- Lagging
- Fascia
- Soil Pipe
- Airing Cupboard
- Cylinder
- Earth Leakage
- Gas Safe
- NICEIC
- NAPIT
- WRAS
- Part P
- Book an emergency callout
- Same-day repair
- Vetted local tradesmen

Use US terms only in US posts:

- HVAC
- Contractor
- Technician
- Service Call
- Breaker Panel
- GFCI
- Main Shut-Off
- Basement
- Water Restoration
- Sump Pump
- PRV
- Drywall
- Garbage Disposal
- Attic
- Licensed
- Background-Checked
- EPA-certified
- NEC-compliant
- State/Local Permits
- 24/7 service call
- Same-day technician
- Licensed emergency contractor

Before insertion, scan each post for cross-region terms and rewrite anything that leaks into the wrong market.

## Required Article Structure

Use the current HTML magazine article pattern in full. Do not insert plain Markdown-only bodies for new emergency blog posts. The stored `posts.content` should be a full HTML article document matching the recent reference layout, with `blog-magazine-wrap`, `capsule-box`, `blog-step-card`, `blog-tips-block`, `blog-when-block`, `blog-comparison-grid`, and the CTA block.

Minimum section order:

1. Full `<!DOCTYPE html>` document with `html lang`, `head`, `title`, and meta description.
2. Header with `h1`, author, updated date, and 5-Star Service meta bar.
3. Opening scene in two or three short paragraphs.
4. Knowledge Capsule Summary in a `capsule-box`.
5. Step 1 through Step 5 as numbered `h2` sections and `blog-step-card` blocks.
6. Practical Advice to Prevent Future [Issue].
7. When to Call a Professional (And When to Repair vs. Replace), including Repair vs. Replace or Save Your Wallet framing.
8. Quick Q&A with real homeowner questions.
9. Two Quick Fun Facts.
10. Need a Trusted [Trade] Fast CTA block.

Keep these items in a separate internal notes file, not in `posts.content`:

- Social Media Post.
- SEO Implementation Checklist, including hero image alt text.
- Regional Lock Verification.

## Insert Workflow

1. Inspect the most recent published UK and US posts for format and tone.
2. Choose topics that do not duplicate existing slugs in Supabase.
3. Save the full article files under:
   - `optimized-blogs/uk-emergencytradesmen/[slug]-gb.md`
   - `optimized-blogs/usa-emergencycontractors/[slug]-us.md`
4. Upsert the posts into Supabase with:
   - `title`
   - `slug`
   - `content`
   - `excerpt`
   - `cover_image` set to the generated hero image path
   - `published: true`
   - `published_at` set to the run time
5. Use region suffixes consistently: `-gb` for UK and `-us` for US.
6. After insertion, check both local URLs:
   - `http://localhost:3000/blog/[uk-slug]`
   - `http://localhost:3001/blog/[us-slug]`

## Validation Checklist

- Latest blog layout is unchanged.
- Full article content is present.
- Required headings and sections are present.
- One matching colour-block hero image exists per new post.
- `cover_image` points at the generated hero image path and the file exists locally.
- UK and US terms do not cross over.
- Slugs are unique.
- Excerpts are clear and concise.
- Stop-slop gate passes at `35/50` or higher before insertion.
- Social post, SEO checklist, and regional-lock verification are kept as internal notes only, not public post content.
- The article reads like a practical human guide, not generic AI copy.


