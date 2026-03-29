# Video-to-Website Skill Implementation Guide (Emergency Tradesmen)

This guide adapts the generic `video-to-website` skill to the specific architecture of the `emergency-tradesmen` project.

## Project Context
- **Framework**: Vite + React
- **Animation**: GSAP (ScrollTrigger)
- **Scrolling**: Lenis
- **Styling**: Tailwind CSS + Custom Vanilla CSS

## Workflow
1. **Frame Extraction**:
   - Frames must be extracted as `.webp` at 1920px max width.
   - Use `scripts/export-next-batch.mjs` for processing.
   - Target 192 frames for a smooth scroll experience (matching `TradesmenScroll.tsx`).
2. **Canvas Rendering**:
   - Use `TradesmenScroll.tsx` as the reference implementation.
   - Enforce `IMAGE_SCALE` between 0.82 and 0.90 for desktop.
   - Sample edge pixels for background blending.
3. **Typography**:
   - Hero font: `font-display` (e.g., Outfit/Inter-Bold).
   - Sizes: Hero heading 12rem (desktop) / 3rem (mobile).
4. **Choreography**:
   - Stagger reveal list items and headlines.
   - Use a horizontal marquee to create depth.
