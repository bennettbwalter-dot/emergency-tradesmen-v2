# BLOG LAYOUT, FONT & STYLE SYSTEM

## GLOBAL FONT (LOCKED)
**Primary font:** Inter
**Fallback stack:** Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif

**Font rules:**
- Use Inter only
- No decorative fonts
- No font mixing
- No random size changes

## TYPOGRAPHY RULES
**Headings:**
- H1: Inter Bold (700)
- H2: Inter Semi-Bold (600)
- H3: Inter Medium (500)

**Body Text:**
- Paragraphs: Inter Regular (400)
- Lists: Inter Regular (400)

**Buttons / CTAs:**
- Inter Semi-Bold (600)
- No italics
- No underlines

## FONT SIZES
**Desktop:**
- H1: 40–44px
- H2: 28–32px
- H3: 22–24px
- Body: 16–18px

**Mobile:**
- H1: 28–32px
- H2: 22–24px
- H3: 18–20px
- Body: 15–16px

**Line height:**
- Headings: 1.2–1.3
- Body text: 1.6–1.8

## BLOG STRUCTURE RULES (MANDATORY)
- One H1 only at the top
- Use H2 for all main sections
- Use H3 only when required
- Do not skip heading levels
- Paragraphs max 3–4 lines
- Bullet points clean and aligned
- No random bolding
- No coloured text inside paragraphs
- No underlined text

## IMAGE RULES
**Image format:**
- 16:9 only
- Full-width within content column
- No watermarks
- No text baked into images

**Image placement:**
- Image 1: Immediately after H1
- Image 2: Between major H2 sections
- Image 3: Near trust / reassurance section

**Never:**
- Place images mid-paragraph
- Stack images back-to-back
- Place images between bullet points

**Captions (optional):**
- Small and subtle
- Descriptive only
- No sales language

## LOCKED BLOG TEMPLATE (USE EVERY TIME)

```markdown
H1: Blog Title (Main Keyword Included)

[FEATURE IMAGE – 16:9 – FULL WIDTH]

Intro paragraph (2–3 short paragraphs)

H2: Section Heading
Paragraph text
Bullet list (if needed)

[OPTIONAL IMAGE – 16:9 – FULL WIDTH]

H2: Section Heading
Paragraph text

H3: Sub-section (only if required)
Paragraph text

H2: Section Heading
Paragraph text
Bullet list

[TRUST IMAGE – 16:9 – FULL WIDTH]

H2: Final Section / Call to Action
Short paragraph
Clear CTA linking back to EmergencyTradesmen.net
```

## AI BLOG FORMAT PROMPT (USE THIS EVERY TIME)

You are a professional web editor formatting a blog post for EmergencyTradesmen.net, a premium emergency home services platform.

**STRICT RULES (must follow exactly):**

**Font Rules:**
- Use Inter as the only font
- No font changes or decorative styling

**Structure Rules:**
- One H1 only (Inter Bold)
- H2 for main sections (Inter Semi-Bold)
- H3 only for sub-sections (Inter Medium)
- Body text must be Inter Regular and consistent

**Layout Rules:**
- Consistent spacing throughout
- Paragraphs max 3–4 lines
- Bullet lists aligned and evenly spaced

**Image Rules:**
- Images must be 16:9
- Place images only after H1 or between H2 sections
- Never place images mid-paragraph

**Output Requirements:**
- Mobile-friendly
- Clean and professional
- Ready to publish with no manual fixes
- No random font sizes or messy formatting

## WEBFLOW / CSS NOTES

**CSS Classes:**
- `.blog-h1` → Inter 700
- `.blog-h2` → Inter 600
- `.blog-h3` → Inter 500
- `.blog-body` → Inter 400
- Never style elements individually

**PRE-PUBLISH CHECKLIST**
- [ ] Only one H1
- [ ] All text uses Inter
- [ ] No random font sizes
- [ ] Images are 16:9 and aligned
- [ ] No overflow or spacing issues
- [ ] Mobile layout is clean
- [ ] Internal links point to EmergencyTradesmen.net
