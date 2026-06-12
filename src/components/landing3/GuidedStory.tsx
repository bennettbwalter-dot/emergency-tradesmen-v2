import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing Page 3 — guided scroll experience under the beam hero.
 *
 * The hero's beam "morphs" into a glowing SVG scroll line (rideradian-style:
 * a path drawn with stroke-dashoffset scrubbed by ScrollTrigger, with a
 * travelling glow head). The line weaves down the page past:
 *   1. a masked-word typography statement,
 *   2. a sticky rotating photo deck cycling through 23 real call-out photos
 *      with a frame counter and chapter typography alongside,
 *   3. supporting text blocks,
 *   4. a final CTA where the line terminates in a glowing node.
 */

interface GuidedStoryProps {
  light: boolean;
}

const PHOTO_COUNT = 23;
const PHOTOS = Array.from({ length: PHOTO_COUNT }, (_, i) => `/landing3/story/story-${String(i + 1).padStart(2, "0")}.webp`);

// deterministic card rotations so the deck looks hand-stacked
const seeded = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const CARD_ROT = PHOTOS.map((_, i) => (seeded(i) - 0.5) * 7);

const CHAPTERS = [
  {
    kicker: "Chapter 01 · The Call-Out",
    title: ["Real people.", "Real emergencies."],
    body: "Every frame here is the moment help arrived — a kitchen flooding, a fuse box dead, a door that would not open.",
  },
  {
    kicker: "Chapter 02 · Every Trade",
    title: ["Every trade,", "on call."],
    body: "Electricians, plumbers, locksmiths, roofers, glaziers, gas engineers, drainage and recovery — one search covers them all.",
  },
  {
    kicker: "Chapter 03 · Always On",
    title: ["Day or night.", "24/7."],
    body: "Emergencies do not book appointments. The network answers at 3pm and at 3am — weekends and holidays included.",
  },
  {
    kicker: "Chapter 04 · At Your Door",
    title: ["Help that", "shows up."],
    body: "Vetted local professionals, minutes from your door, with the tools and the experience to put things right.",
  },
];

/** Catmull-Rom → cubic bezier path through pixel waypoints. */
function buildPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export const GuidedStory = ({ light }: GuidedStoryProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const lineGlowRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const deckWrapRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement>(null);
  const supportRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const line = lineRef.current;
    const lineGlow = lineGlowRef.current;
    const dot = dotRef.current;
    if (!root || !svg || !line || !lineGlow || !dot) return;

    const ctx = gsap.context(() => {
      // ---------- the guided scroll line ----------
      let pathLen = 0;
      const layoutLine = () => {
        const W = root.clientWidth;
        const H = root.scrollHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));
        // weave: morph zone → intro → behind the deck → supporting blocks → CTA
        const pts: [number, number][] = [
          [0.5 * W, 0],
          [0.5 * W, 0.035 * H],
          [0.32 * W, 0.085 * H],
          [0.66 * W, 0.145 * H],
          [0.44 * W, 0.205 * H],
          [0.5 * W, 0.25 * H],
          [0.47 * W, 0.38 * H],
          [0.53 * W, 0.52 * H],
          [0.47 * W, 0.64 * H],
          [0.5 * W, 0.72 * H],
          [0.3 * W, 0.785 * H],
          [0.7 * W, 0.865 * H],
          [0.5 * W, 0.925 * H],
          [0.5 * W, 0.985 * H],
        ];
        const d = buildPath(pts);
        line.setAttribute("d", d);
        lineGlow.setAttribute("d", d);
        pathLen = line.getTotalLength();
        line.style.strokeDasharray = String(pathLen);
        lineGlow.style.strokeDasharray = String(pathLen);
      };
      layoutLine();

      const drawState = { p: 0 };
      const applyDraw = () => {
        const off = pathLen * (1 - drawState.p);
        line.style.strokeDashoffset = String(off);
        lineGlow.style.strokeDashoffset = String(off);
        const pt = line.getPointAtLength(pathLen * drawState.p);
        dot.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
        dot.style.opacity = drawState.p > 0.002 && drawState.p < 0.998 ? "1" : "0";
      };
      applyDraw();

      ScrollTrigger.create({
        trigger: root,
        start: "top 75%",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          drawState.p = self.progress;
          applyDraw();
        },
      });

      // ---------- intro statement: masked word reveal ----------
      const introWords = introRef.current?.querySelectorAll<HTMLElement>("[data-word]");
      if (introWords?.length) {
        gsap.fromTo(
          introWords,
          { yPercent: 115 },
          {
            yPercent: 0,
            stagger: 0.05,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: introRef.current, start: "top 78%", toggleActions: "play none none reverse" },
          },
        );
      }

      // ---------- photo deck + chapters (one scrubbed master timeline) ----------
      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const chapters = chapterRefs.current.filter(Boolean) as HTMLDivElement[];
      if (cards.length === PHOTO_COUNT && deckWrapRef.current) {
        cards.forEach((card, i) => {
          gsap.set(card, {
            rotation: CARD_ROT[i],
            scale: i === 0 ? 1 : 0.95,
            zIndex: PHOTO_COUNT - i,
            transformOrigin: "50% 60%",
          });
        });
        chapters.forEach((ch, i) => gsap.set(ch, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 36 }));

        const STEPS = PHOTO_COUNT - 1; // 22 card-departures
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: deckWrapRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.5,
            onUpdate: (self) => {
              if (counterRef.current) {
                const idx = Math.min(Math.floor(self.progress * STEPS + 0.0001) + 1, PHOTO_COUNT);
                counterRef.current.textContent = `${String(idx).padStart(2, "0")} / ${PHOTO_COUNT}`;
              }
            },
          },
        });

        for (let i = 0; i < STEPS; i++) {
          // top card lifts away with a tilt
          tl.to(cards[i], {
            yPercent: -36,
            rotation: CARD_ROT[i] + (CARD_ROT[i] >= 0 ? 9 : -9),
            autoAlpha: 0,
            duration: 0.85,
          }, i);
          // the next card settles into place
          tl.to(cards[i + 1], { scale: 1, duration: 0.85 }, i + 0.06);
        }

        // chapter typography swaps at quarter points of the deck
        const chapterSpan = STEPS / CHAPTERS.length;
        for (let c = 1; c < CHAPTERS.length; c++) {
          const at = c * chapterSpan;
          tl.to(chapters[c - 1], { autoAlpha: 0, y: -30, duration: 0.9 }, at - 0.5);
          tl.fromTo(chapters[c], { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.9 }, at + 0.45);
        }
      }

      // ---------- supporting blocks + CTA reveals ----------
      [...supportRefs.current.filter(Boolean), ctaRef.current].forEach((el) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 48 },
          {
            autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
          },
        );
      });

      // re-measure on resize (path + triggers)
      let resizeTimer = 0;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          layoutLine();
          applyDraw();
          ScrollTrigger.refresh();
        }, 180);
      });
      ro.observe(root);
      return () => {
        ro.disconnect();
        window.clearTimeout(resizeTimer);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const introStatement = "Behind every emergency is a local expert already on the way.";

  return (
    <section ref={rootRef} id="guided-story" className="relative overflow-x-clip bg-background text-foreground">
      {/* the guided scroll line (behind all content) */}
      <svg ref={svgRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden preserveAspectRatio="none">
        <defs>
          <linearGradient id="l3-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f0c468" />
          </linearGradient>
        </defs>
        <path ref={lineGlowRef} fill="none" stroke="url(#l3-line-grad)" strokeWidth="10" strokeLinecap="round" opacity={light ? 0.22 : 0.28} style={{ filter: "blur(6px)" }} />
        <path ref={lineRef} fill="none" stroke="url(#l3-line-grad)" strokeWidth="2.5" strokeLinecap="round" opacity={0.95} />
      </svg>
      {/* travelling glow head */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute left-0 top-0 z-0 h-4 w-4 rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, #7dd3fc 38%, rgba(56,189,248,0) 72%)",
          boxShadow: "0 0 22px 8px rgba(56,189,248,0.55), 0 0 60px 24px rgba(56,189,248,0.2)",
        }}
      />

      {/* 1 — beam morph zone */}
      <div className="relative z-10 flex h-[30vh] min-h-[200px] flex-col items-center justify-start pt-0">
        <div
          className="h-24 w-10 -mt-1"
          style={{
            background: "radial-gradient(ellipse 50% 90% at 50% 0%, rgba(125,211,252,0.55) 0%, rgba(56,189,248,0.18) 45%, transparent 75%)",
            filter: "blur(2px)",
          }}
        />
        <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.34em] text-sky-500">The response continues</p>
      </div>

      {/* 2 — typography statement with masked word reveal */}
      <div ref={introRef} className="relative z-10 mx-auto max-w-4xl px-6 pb-[16vh] text-center">
        <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.08]">
          {introStatement.split(" ").map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <span data-word className="inline-block will-change-transform">
                {["local", "expert"].includes(word) ? (
                  <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">{word}</span>
                ) : word}
              </span>
              {i < introStatement.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
      </div>

      {/* 3 — the rotating photo deck with chapter typography */}
      <div ref={deckWrapRef} id="story-deck" className="relative z-10 h-[520vh]">
        <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center gap-6 md:grid md:grid-cols-2 md:gap-0">
          {/* chapters */}
          <div className="relative order-2 h-[34svh] w-full px-6 md:order-1 md:h-full">
            {CHAPTERS.map((ch, i) => (
              <div
                key={ch.kicker}
                ref={(el) => { chapterRefs.current[i] = el; }}
                className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center md:inset-x-0 md:pl-[12%] md:pr-8 md:text-left"
              >
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.32em] text-sky-500">{ch.kicker}</p>
                <h3 className="mt-3 font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-[1.04]">
                  {ch.title[0]}
                  <br />
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                    {ch.title[1]}
                  </span>
                </h3>
                <p className="mx-auto mt-4 max-w-md text-sm md:text-base text-muted-foreground md:mx-0">{ch.body}</p>
              </div>
            ))}
          </div>

          {/* photo deck */}
          <div className="relative order-1 flex h-[52svh] w-full items-center justify-center md:order-2 md:h-full">
            <div className="relative aspect-[3/4] h-[88%] max-h-[78svh] w-auto max-w-[86vw]">
              {PHOTOS.map((src, i) => (
                <div
                  key={src}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  className="absolute inset-0 overflow-hidden rounded-3xl border border-foreground/10 shadow-2xl will-change-transform"
                >
                  <img
                    src={src}
                    alt={`Emergency call-out ${i + 1}`}
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                </div>
              ))}
              {/* frame counter — bottom-right, like a film slate */}
              <div className="absolute bottom-4 right-4 z-50 rounded-full bg-black/55 px-3.5 py-1.5 backdrop-blur">
                <span ref={counterRef} className="font-mono text-xs font-bold tracking-widest text-white">01 / {PHOTO_COUNT}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 — supporting text blocks along the line */}
      <div className="relative z-10 mx-auto max-w-6xl space-y-[14vh] px-6 py-[12vh]">
        <div
          ref={(el) => { supportRefs.current[0] = el; }}
          className="md:w-[46%]"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-sky-500">For Homes & Businesses</p>
          <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
            One problem. One search.{" "}
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">The right tradesperson.</span>
          </h3>
          <p className="mt-4 text-sm md:text-base text-muted-foreground">
            Tell us what went wrong and where you are. We surface trusted local professionals
            with the skills to fix it — fast, transparent, and free to use.
          </p>
          <Link to="/" className="mt-5 inline-block text-sm font-semibold text-sky-500 hover:underline">
            Find emergency help &rarr;
          </Link>
        </div>

        <div
          ref={(el) => { supportRefs.current[1] = el; }}
          className="md:ml-auto md:w-[46%] md:text-right"
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-amber-500">For Tradespeople</p>
          <h3 className="mt-3 font-display text-3xl md:text-4xl font-bold leading-tight">
            Your next call-out is{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">already searching.</span>
          </h3>
          <p className="mt-4 text-sm md:text-base text-muted-foreground">
            Claim your trade, verify your profile, and get found at the exact moment
            customers urgently need you — direct calls, not time-wasters.
          </p>
          <Link to="/pricing" className="mt-5 inline-block text-sm font-semibold text-amber-500 hover:underline">
            Claim your trade &rarr;
          </Link>
        </div>
      </div>

      {/* 5 — final CTA: the line terminates here */}
      <div ref={ctaRef} className="relative z-10 mx-auto max-w-3xl px-6 pb-[14vh] pt-[4vh] text-center">
        <div
          className="mx-auto mb-8 h-5 w-5 rounded-full"
          style={{
            background: "radial-gradient(circle, #ffffff 0%, #fcd34d 40%, rgba(252,211,77,0) 75%)",
            boxShadow: "0 0 26px 10px rgba(252,211,77,0.4)",
          }}
        />
        <h2 className="font-display text-4xl md:text-6xl font-bold leading-[1.05]">
          It cannot wait?{" "}
          <span className="bg-gradient-to-r from-sky-400 to-amber-300 bg-clip-text text-transparent">Neither can we.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm md:text-lg text-muted-foreground">
          Trusted emergency tradespeople near you — when the lights go out, pipes burst,
          roofs leak, windows break, or urgent repairs cannot wait.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/"
            className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-9 py-4 text-base font-bold text-slate-950 shadow-[0_0_30px_rgba(56,150,255,0.45)] transition-transform hover:scale-105"
          >
            Find Emergency Help
          </Link>
          <Link
            to="/pricing"
            className="rounded-full border border-border px-9 py-4 text-base font-semibold text-foreground transition-colors hover:bg-foreground/5"
          >
            Claim Your Trade
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GuidedStory;
