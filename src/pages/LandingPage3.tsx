import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { useSimpleTheme } from "@/components/simple-theme";
import { useLocalization } from "@/contexts/LocalizationContext";
import { US_STATES } from "@/lib/us_states";
import { Hero3D } from "@/components/landing3/Hero3D";
import { Landing3Services } from "@/components/landing3/Landing3Services";

// Original landing page sections, reused and re-arranged below the new hero
const EmergencyChatInterface = lazy(() => import("@/components/EmergencyChatInterface").then(m => ({ default: m.EmergencyChatInterface })));
const HowItWorksSection = lazy(() => import("@/components/sections/HowItWorksSection").then(m => ({ default: m.HowItWorksSection })));
const EmergencyServicesSection = lazy(() => import("@/components/sections/EmergencyServicesSection").then(m => ({ default: m.EmergencyServicesSection })));
const BreakdownSection = lazy(() => import("@/components/sections/BreakdownSection").then(m => ({ default: m.BreakdownSection })));
const SEOContentSection = lazy(() => import("@/components/sections/SEOContentSection").then(m => ({ default: m.SEOContentSection })));
const LatestBlogSection = lazy(() => import("@/components/sections/LatestBlogSection").then(m => ({ default: m.LatestBlogSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));
const HomeEmergencyAd = lazy(() => import("@/components/HomeEmergencyAd").then(m => ({ default: m.HomeEmergencyAd })));
const GeneralFAQSection = lazy(() => import("@/components/GeneralFAQSection").then(m => ({ default: m.GeneralFAQSection })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

/**
 * Landing Page 3  -  experimental cinematic landing page (preview at /landing-3).
 * Does NOT replace the live landing page (/). noindex'd until approved.
 */

// Mount children only when scrolled near the viewport (same pattern as Index)
function DeferredSection({ minHeight, children }: { minHeight: number; children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {isVisible ? (
        <Suspense fallback={<div className="w-full" style={{ minHeight }} />}>{children}</Suspense>
      ) : null}
    </div>
  );
}

// Scroll-reveal wrapper for the re-arranged original sections
function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 42 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 0.65, 0.3, 0.95] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Exact replica of the original landing page's dynamic headline:
 * L[logo]CAL / TRADESMEN|CONTRACTORS / near {CITY[, ST]}  -  same localization
 * logic as components/sections/HeroSection.tsx.
 */
function OriginalDynamicHeadline({ light }: { light: boolean }) {
  const { settings, detectedCity, detectedState } = useLocalization();

  const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== "UK" && detectedCity.toUpperCase() !== "UNITED KINGDOM" ? detectedCity : "ME").toUpperCase();
  const stateAbbrev = useMemo(() => {
    if (settings.countryCode !== "US" || !detectedState) return "";
    const match = US_STATES.find(
      (s) => s.name.toLowerCase() === detectedState.toLowerCase() || s.code.toLowerCase() === detectedState.toLowerCase(),
    );
    return match?.code ?? "";
  }, [settings.countryCode, detectedState]);
  const titleLocation = settings.countryCode === "US" && detectedCity && stateAbbrev
    ? `${displayCity}, ${stateAbbrev}`
    : displayCity;
  const displayState = detectedState || (settings.countryCode === "US" ? "US" : "UK");

  const solid = light ? "text-slate-900" : "text-white";
  const shadow = light ? "" : "drop-shadow-[0_4px_18px_rgba(0,0,0,0.78)]";

  return (
    <div className="relative flex flex-col items-center justify-center px-1 sm:px-4 w-full overflow-visible">
      <h1 className="text-center max-w-4xl mx-auto w-full">
        {/* LOCAL with the original gold O logo */}
        <span
          className={`block ${solid} ${shadow} text-[clamp(2rem,11vw,3.75rem)]`}
          style={{ fontFamily: '"Archivo Black", Impact, sans-serif', letterSpacing: "-0.02em", lineHeight: 1 }}
        >
          L<img src="/et-logo-v3.webp" alt="O" width="64" height="64" decoding="async" className="inline-block h-[0.88em] w-auto align-middle -translate-y-[0.06em] mx-[0.02em] brightness-125 drop-shadow-lg" />CAL
        </span>

        {/* TRADESMEN / CONTRACTORS  -  dominant gold */}
        <span
          className="hero-trade-title block bg-clip-text text-transparent text-[clamp(2rem,9.2vw,5.25rem)] mt-1"
          style={{
            fontFamily: '"Archivo Black", Impact, sans-serif',
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
            backgroundImage: "linear-gradient(180deg, #f0d488 0%, #d4af37 45%, #b8893f 100%)",
          }}
        >
          {(settings.tradeTerm || "Tradesmen").toUpperCase()}
        </span>

        {/* near [CITY] with the gold swoosh */}
        <span className="flex items-end justify-center gap-[0.3em] mt-2 whitespace-nowrap">
          <span className="relative inline-block">
            <span
              className={`${solid} ${shadow} text-[clamp(1.25rem,5.5vw,2.5rem)] leading-none`}
              style={{ fontFamily: '"Kaushan Script", cursive', fontWeight: 400 }}
            >
              near
            </span>
            <svg aria-hidden="true" viewBox="0 0 120 10" preserveAspectRatio="none" className="absolute left-0 right-0 -bottom-[0.15em] w-full h-[0.35em] pointer-events-none">
              <path d="M2 7 C 20 2, 50 2, 75 5 S 110 8, 118 3" fill="none" stroke="url(#nearUnderlineL3)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="nearUnderlineL3" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#e3c063" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#caa052" />
                  <stop offset="100%" stopColor="#b8893f" stopOpacity="0.4" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span
            className={`${solid} ${shadow} text-[clamp(1.75rem,8.5vw,3.25rem)] min-w-0 truncate`}
            style={{ fontFamily: '"Archivo Black", Impact, sans-serif', letterSpacing: "-0.02em", lineHeight: 1 }}
          >
            {titleLocation}
          </span>
        </span>
      </h1>

      <p className={`mt-4 text-[10px] sm:text-sm md:text-base tracking-wide uppercase ${light ? "text-slate-600" : "text-white/85 drop-shadow-[0_3px_12px_rgba(0,0,0,0.72)]"}`}>
        Emergency {settings.tradeTerm} {displayState} | Nationwide 24/7 Help
      </p>
    </div>
  );
}

const LandingPage3 = () => {
  const { theme } = useSimpleTheme();
  const light = theme === "light";
  const { detectedCity } = useLocalization();

  // Same dynamic document title logic as the original landing page (Index.tsx)
  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port : "";
  const isUSDomain =
    import.meta.env.MODE === "us" ||
    hostname.includes("emergencycontractors.net") ||
    ((hostname === "localhost" || hostname === "127.0.0.1") && port === "3001");
  const siteTradeTerm = isUSDomain ? "Contractors" : "Tradesmen";
  const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== "UK" && detectedCity.toUpperCase() !== "UNITED KINGDOM" ? detectedCity : "Near You");

  return (
    <div className="bg-background text-foreground">
      <Helmet>
        <title>{`Emergency ${siteTradeTerm} Near You${displayCity !== "Near You" ? ` in ${displayCity}` : ""}`}</title>
        <meta
          name="description"
          content={`Find local ${siteTradeTerm.toLowerCase()} in ${displayCity} for emergency repairs. Public listings are available 24/7 for plumbing, electrical, locksmith & HVAC.`}
        />
        {/* experimental preview page  -  keep out of search until approved */}
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Original site header: original logo, nav and the dark/light ModeToggle */}
      <Header />

      {/* Act 1: the emergency beam hero with the original dynamic headline */}
      <Hero3D mode={light ? "light" : "dark"} headline={<OriginalDynamicHeadline light={light} />} />

      {/* Act 2: get help now  -  the original emergency search */}
      <section id="get-help" className="relative scroll-mt-20 bg-background pb-20 pt-0">
        {/* the beam lands at the end of the hero and continues as this scroll line */}
        <div aria-hidden className="flex flex-col items-center pb-12">
          <div className="h-28 w-[3px] rounded-full bg-gradient-to-b from-sky-400/0 via-sky-400/80 to-amber-300 shadow-[0_0_18px_rgba(56,189,248,0.55)]" />
          <div
            className="-mt-1 h-3.5 w-3.5 rounded-full"
            style={{
              background: "radial-gradient(circle, #ffffff 0%, #7dd3fc 45%, rgba(56,189,248,0) 75%)",
              boxShadow: "0 0 18px 7px rgba(56,189,248,0.5)",
            }}
          />
        </div>
        <div className="container-wide">
          <Reveal>
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-sky-500">Get Help Now</p>
              <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold text-foreground">
                Describe your emergency.{" "}
                <span className="bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
                  We&apos;ll guide help to your door.
                </span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mx-auto w-full max-w-4xl">
              <Suspense fallback={<div className="h-32 rounded-3xl bg-black/10 animate-pulse" aria-hidden />}>
                <EmergencyChatInterface />
              </Suspense>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Act 3: the original landing page content, re-arranged and animated */}
      <main>
        <Reveal>
          <DeferredSection minHeight={700}>
            <HowItWorksSection />
          </DeferredSection>
        </Reveal>

        <Reveal>
          <DeferredSection minHeight={800}>
            <EmergencyServicesSection />
          </DeferredSection>
        </Reveal>

        <Reveal>
          <DeferredSection minHeight={650}>
            <BreakdownSection />
          </DeferredSection>
        </Reveal>

        {/* quick actions + business CTA band (new, theme-aware) */}
        <Landing3Services />

        <Reveal>
          <DeferredSection minHeight={1100}>
            <SEOContentSection />
          </DeferredSection>
        </Reveal>

        <Reveal>
          <DeferredSection minHeight={500}>
            <LatestBlogSection />
          </DeferredSection>
        </Reveal>

        <Reveal>
          <DeferredSection minHeight={500}>
            <CTASection />
          </DeferredSection>
        </Reveal>

        <div className="container mx-auto px-4 py-16">
          <Reveal>
            <DeferredSection minHeight={420}>
              <HomeEmergencyAd />
            </DeferredSection>
          </Reveal>
        </div>

        <div className="container mx-auto flex flex-col items-center px-4 pb-20 pt-4">
          <Reveal>
            <h2 className="mb-8 text-center font-display text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </Reveal>
          <div className="w-full max-w-3xl">
            <DeferredSection minHeight={320}>
              <GeneralFAQSection initiallyOpened={true} />
            </DeferredSection>
          </div>
        </div>
      </main>

      <DeferredSection minHeight={520}>
        <Footer />
      </DeferredSection>
    </div>
  );
};

export default LandingPage3;
