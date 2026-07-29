import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, HeartHandshake, MapPin, PhoneCall, Search, ShieldCheck, Zap } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocalization } from "@/contexts/LocalizationContext";
import { TradesmenScroll } from "@/components/animations/TradesmenScroll";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface GuidedStoryProps {
  displayCity: string;
  isUSSite: boolean;
  light: boolean;
}

type JourneyItem = {
  accent: "sky" | "cyan" | "gold" | "emerald";
  align: "left" | "right";
  kicker: string;
  title: string;
  body: string;
  Icon: typeof Search;
};

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export const GuidedStory = ({ displayCity, isUSSite, light }: GuidedStoryProps) => {
  const { settings } = useLocalization();
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const lineGlowRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const listingTerm = settings.countryCode === "US" ? "contractor" : "tradesmen";
  const contactTerm = settings.countryCode === "US" ? "contractor" : "tradesman";
  const sourceLabel = isUSSite ? "Weather, safety, road and recall signals" : "Weather, flood, road and safety signals";

  const steps: JourneyItem[] = [
    {
      accent: "sky",
      align: "left",
      kicker: "01 / Find the signal",
      title: "Find your local expert",
      body: `Select your service and city to view public ${listingTerm} listings operating in your area right now.`,
      Icon: Search,
    },
    {
      accent: "cyan",
      align: "right",
      kicker: "02 / Direct contact",
      title: "Contact directly",
      body: `No middlemen, no hidden fees. Call, WhatsApp, or email the ${contactTerm} directly to explain your emergency and get an immediate ETA.`,
      Icon: PhoneCall,
    },
    {
      accent: "gold",
      align: "left",
      kicker: "03 / Problem solved",
      title: "Help reaches the door",
      body: "Your local expert arrives, gives a clear quote, and handles the emergency.",
      Icon: HeartHandshake,
    },
  ];

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const line = lineRef.current;
    const lineGlow = lineGlowRef.current;
    const dot = dotRef.current;
    if (!root || !svg || !line || !lineGlow || !dot) return;

    const ctx = gsap.context(() => {
      let pathLen = 0;
      let markerYs: number[] = [];

      const layoutLine = () => {
        const W = root.clientWidth;
        const H = root.scrollHeight;
        const rootRect = root.getBoundingClientRect();
        const isMobile = window.innerWidth <= 900;
        const markers = Array.from(root.querySelectorAll<HTMLElement>("[data-line-marker]"));
        markerYs = markers.map((marker) => {
          const markerRect = marker.getBoundingClientRect();
          return markerRect.top - rootRect.top + markerRect.height / 2;
        });
        const markerXs = markers.map((marker) => {
          const markerRect = marker.getBoundingClientRect();
          return markerRect.left - rootRect.left + markerRect.width / 2;
        });

        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));

        const centerX = W * 0.5;
        let pathPoints: [number, number][];
        if (isMobile) {
          // Mobile cards alternate lanes, so the line routes through the open
          // side of each card and crosses only in the whitespace between them.
          const clearance = clamp(W * 0.11, 36, 52);
          const items = Array.from(root.querySelectorAll<HTMLElement>(".l3-journey-item"));
          const mobileSegments = items.flatMap((item, index) => {
            const card = item.querySelector<HTMLElement>(".l3-journey-card");
            const marker = item.querySelector<HTMLElement>("[data-line-marker]");
            if (!card) return [];

            const cardRect = card.getBoundingClientRect();
            const markerRect = marker?.getBoundingClientRect();
            const left = cardRect.left - rootRect.left;
            const right = cardRect.right - rootRect.left;
            const top = cardRect.top - rootRect.top;
            const bottom = cardRect.bottom - rootRect.top;
            const markerX = markerRect ? markerRect.left - rootRect.left + markerRect.width / 2 : markerXs[index] ?? centerX;
            const faqPassThrough = card.classList.contains("l3-faq-card");

            let x = centerX;
            if (!faqPassThrough) {
              const markerIsLeft = markerX < left;
              const leftLane = clamp(markerX, 18, Math.max(18, left - clearance));
              const rightLane = clamp(markerX, Math.min(W - 18, right + clearance), W - 18);
              x = markerIsLeft ? leftLane : rightLane;
            }

            return [{
              x,
              top: Math.max(0, top - clearance),
              mid: top + cardRect.height / 2,
              bottom: Math.min(H - 70, bottom + clearance),
            }];
          });

          pathPoints = [[centerX, 0]];
          if (mobileSegments.length) {
            const first = mobileSegments[0];
            const firstTurnY = Math.max(110, Math.min(first.top - 72, H * 0.055));
            pathPoints.push([centerX, firstTurnY], [first.x, Math.max(120, first.top)]);

            mobileSegments.forEach((segment) => {
              const last = pathPoints[pathPoints.length - 1];
              const lastX = last[0];
              const lastY = last[1];
              const gap = segment.top - lastY;

              if (Math.abs(lastX - segment.x) > 2 && gap > clearance * 1.4) {
                const turnY = lastY + gap * 0.5;
                pathPoints.push([lastX, turnY], [segment.x, turnY]);
              }

              pathPoints.push(
                [segment.x, Math.max(segment.top, lastY + 1)],
                [segment.x, segment.mid],
                [segment.x, segment.bottom],
              );
            });

            const last = pathPoints[pathPoints.length - 1];
            const exitY = Math.min(H - 96, Math.max(last[1] + 80, H - 170));
            pathPoints.push([last[0], exitY], [centerX, H - 70]);
          } else {
            pathPoints.push(
              [centerX, H * 0.08],
              [W * 0.18, H * 0.24],
              [W * 0.82, H * 0.42],
              [W * 0.18, H * 0.62],
              [W * 0.82, H * 0.78],
              [centerX, H - 70],
            );
          }
        } else {
          // Desktop: weave gently around the centre, between the left/right cards.
          pathPoints = [
            [centerX, 0],
            [centerX, Math.max(120, H * 0.04)],
            ...markerYs.map((y, index): [number, number] => {
              const drift = index % 2 === 0 ? -W * 0.025 : W * 0.025;
              return [centerX + drift, y];
            }),
            [centerX, H - 80],
          ];
        }

        const d = buildPath(pathPoints);
        line.setAttribute("d", d);
        lineGlow.setAttribute("d", d);
        pathLen = line.getTotalLength();
        line.style.strokeDasharray = String(pathLen);
        lineGlow.style.strokeDasharray = String(pathLen);
      };

      const drawState = { p: 0 };
      const applyDraw = () => {
        if (!pathLen) return;
        const currentLength = pathLen * drawState.p;
        const off = pathLen - currentLength;
        line.style.strokeDashoffset = String(off);
        lineGlow.style.strokeDashoffset = String(off);

        const pt = line.getPointAtLength(currentLength);
        dot.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
        dot.style.opacity = drawState.p > 0.002 && drawState.p < 0.998 ? "1" : "0";

        itemRefs.current.forEach((item, index) => {
          if (!item) return;
          const markerY = markerYs[index] ?? 0;
          const activated = pt.y >= markerY - 64;
          const passed = pt.y >= markerY + 180;
          item.classList.toggle("is-active", activated);
          item.classList.toggle("is-past", passed);
        });
      };

      layoutLine();
      applyDraw();

      const trigger = ScrollTrigger.create({
        trigger: root,
        start: "top 76%",
        end: "bottom 82%",
        scrub: 0.55,
        onUpdate: (self) => {
          drawState.p = self.progress;
          applyDraw();
        },
      });

      const introWords = root.querySelectorAll<HTMLElement>("[data-journey-word]");
      gsap.fromTo(
        introWords,
        { yPercent: 115 },
        {
          yPercent: 0,
          stagger: 0.045,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: root.querySelector("[data-journey-intro]"), start: "top 80%", toggleActions: "play none none reverse" },
        },
      );

      let resizeTimer = 0;
      const ro = new ResizeObserver(() => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          layoutLine();
          applyDraw();
          ScrollTrigger.refresh();
        }, 160);
      });
      ro.observe(root);

      return () => {
        trigger.kill();
        ro.disconnect();
        window.clearTimeout(resizeTimer);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  const intro = "A Smarter Way to Find Local Emergency Help";

  return (
    <section ref={rootRef} id="guided-story" className={cn("l3-journey", light ? "l3-journey--light" : "l3-journey--dark")}>
      <svg ref={svgRef} className="l3-journey-line" aria-hidden preserveAspectRatio="none">
        <defs>
          <linearGradient id="l3-line-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="48%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f0c468" />
          </linearGradient>
        </defs>
        <path ref={lineGlowRef} fill="none" stroke="url(#l3-line-grad)" strokeWidth="12" strokeLinecap="round" opacity={light ? 0.2 : 0.3} style={{ filter: "blur(7px)" }} />
        <path ref={lineRef} fill="none" stroke="url(#l3-line-grad)" strokeWidth="3" strokeLinecap="round" opacity="0.96" />
      </svg>

      <div
        ref={dotRef}
        className="l3-journey-dot"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, #7dd3fc 38%, rgba(56,189,248,0) 72%)",
          boxShadow: "0 0 22px 8px rgba(56,189,248,0.55), 0 0 60px 24px rgba(56,189,248,0.2)",
        }}
      />

      <div className="l3-journey-morph" aria-hidden>
        <div className="l3-journey-morph-beam" />
      </div>

      <div data-journey-intro className="l3-journey-intro">
        <h2>
          {intro.split(" ").map((word, index) => (
            <span key={`${word}-${index}`} className="l3-journey-word-shell">
              <span data-journey-word>{["Smarter", "Emergency", "Help"].includes(word) ? <em>{word}</em> : word}</span>
              {index < intro.split(" ").length - 1 ? " " : ""}
            </span>
          ))}
        </h2>
      </div>

      <div className="l3-journey-stack">
        {steps.map((step, index) => {
          const Icon = step.Icon;
          return (
            <article
              key={step.kicker}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={cn("l3-journey-item", `l3-journey-item--${step.align}`, `l3-journey-item--${step.accent}`)}
            >
              <span data-line-marker className="l3-journey-marker" aria-hidden />
              <div className="l3-journey-card l3-step-card">
                <div className="l3-step-icon">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="l3-journey-kicker">{step.kicker}</p>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </div>
            </article>
          );
        })}

        <article
          ref={(el) => { itemRefs.current[3] = el; }}
          className="l3-journey-item l3-journey-item--wide l3-journey-item--gold"
        >
          <span data-line-marker className="l3-journey-marker" aria-hidden />
          <div className="l3-journey-card l3-journey-card--flush">
            <TradesmenScroll compact />
          </div>
        </article>

        <article
          ref={(el) => { itemRefs.current[4] = el; }}
          className="l3-journey-item l3-journey-item--right l3-journey-item--sky"
        >
          <span data-line-marker className="l3-journey-marker" aria-hidden />
          <div className="l3-journey-card l3-alert-card">
            <MapPin className="h-6 w-6" />
            <p className="l3-journey-kicker">Live local awareness</p>
            <h3>Know what is happening in {displayCity} before you call.</h3>
            <p>{sourceLabel} can change which emergency help you need first.</p>
            <Link to="/alerts">
              Open Live Alerts
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <article
          ref={(el) => { itemRefs.current[5] = el; }}
          className="l3-journey-item l3-journey-item--left l3-journey-item--cyan"
        >
          <span data-line-marker className="l3-journey-marker" aria-hidden />
          <div className="l3-journey-card l3-final-card">
            <ShieldCheck className="h-7 w-7" />
            <p className="l3-journey-kicker">Final routing</p>
            <h3>Urgent repairs need a fast call.</h3>
            <p>Find emergency help near you when lights go out, pipes burst, vehicles stop, locks fail, or repairs cannot wait.</p>
            <div className="l3-final-actions">
              <Link to="/home#manual-search">
                Find Emergency Help
                <Zap className="h-4 w-4" />
              </Link>
              <Link to="/pricing">
                Claim Your Trade
                <Clock className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>

        <article
          ref={(el) => { itemRefs.current[6] = el; }}
          className="l3-journey-item l3-journey-item--wide l3-journey-item--gold"
        >
          <span data-line-marker className="l3-journey-marker" aria-hidden />
          <div className="l3-journey-card l3-faq-card">
            <p className="l3-journey-kicker">Questions before you call</p>
            <h2>Frequently Asked Questions</h2>
            <GeneralFAQSection initiallyOpened />
          </div>
        </article>
      </div>

      <div className="l3-journey-terminus" aria-hidden />
    </section>
  );
};

export default GuidedStory;
