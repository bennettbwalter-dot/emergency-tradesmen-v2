import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing Page 3 — the guided scroll line (rideradian-style).
 *
 * The hero's beam lands at the bottom of the hero and continues here as a
 * glowing SVG path that draws itself with scroll (stroke-dashoffset scrub)
 * and weaves down the page, with a travelling glow head and a terminus node.
 */

interface ScrollLineProps {
  light: boolean;
}

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

export const ScrollLine = ({ light }: ScrollLineProps) => {
  const rootRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const lineGlowRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    const line = lineRef.current;
    const lineGlow = lineGlowRef.current;
    const dot = dotRef.current;
    if (!root || !svg || !line || !lineGlow || !dot) return;

    const ctx = gsap.context(() => {
      let pathLen = 0;
      const layoutLine = () => {
        const W = root.clientWidth;
        const H = root.scrollHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        svg.setAttribute("height", String(H));
        const pts: [number, number][] = [
          [0.5 * W, 0],
          [0.5 * W, 0.05 * H],
          [0.3 * W, 0.14 * H],
          [0.7 * W, 0.26 * H],
          [0.36 * W, 0.38 * H],
          [0.62 * W, 0.5 * H],
          [0.32 * W, 0.62 * H],
          [0.68 * W, 0.74 * H],
          [0.42 * W, 0.85 * H],
          [0.5 * W, 0.93 * H],
          [0.5 * W, 0.975 * H],
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
        start: "top 80%",
        end: "bottom bottom",
        scrub: 0.6,
        onUpdate: (self) => {
          drawState.p = self.progress;
          applyDraw();
        },
      });

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

  return (
    <section ref={rootRef} aria-hidden className="relative h-[300vh] overflow-x-clip bg-background">
      <svg ref={svgRef} className="pointer-events-none absolute inset-0" preserveAspectRatio="none">
        <defs>
          <linearGradient id="l3-scrollline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="45%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#f0c468" />
          </linearGradient>
        </defs>
        <path ref={lineGlowRef} fill="none" stroke="url(#l3-scrollline-grad)" strokeWidth="10" strokeLinecap="round" opacity={light ? 0.22 : 0.28} style={{ filter: "blur(6px)" }} />
        <path ref={lineRef} fill="none" stroke="url(#l3-scrollline-grad)" strokeWidth="2.5" strokeLinecap="round" opacity={0.95} />
      </svg>

      {/* travelling glow head */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute left-0 top-0 h-4 w-4 rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, #7dd3fc 38%, rgba(56,189,248,0) 72%)",
          boxShadow: "0 0 22px 8px rgba(56,189,248,0.55), 0 0 60px 24px rgba(56,189,248,0.2)",
        }}
      />

      {/* terminus node where the line ends */}
      <div
        className="pointer-events-none absolute bottom-[1.2%] left-1/2 h-5 w-5 -translate-x-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, #ffffff 0%, #fcd34d 40%, rgba(252,211,77,0) 75%)",
          boxShadow: "0 0 26px 10px rgba(252,211,77,0.4)",
        }}
      />
    </section>
  );
};

export default ScrollLine;
