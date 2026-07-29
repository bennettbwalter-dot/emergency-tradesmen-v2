import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GuestGate } from "@/components/GuestGate";
import { FloatingTourHub } from "@/components/FloatingTourHub";
import { useSimpleTheme } from "@/components/simple-theme";
import { US_STATES } from "@/lib/us_states";
import { Hero3D } from "@/components/landing3/Hero3D";
import { GuidedStory } from "@/components/landing3/GuidedStory";

const Footer = lazy(() =>
  import("@/components/Footer").then((module) => ({ default: module.Footer }))
);

function DeferredSection({
  minHeight,
  children,
}: {
  minHeight: number;
  children: ReactNode;
}) {
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
      { rootMargin: "0px 0px 160px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div ref={ref} style={{ minHeight: isVisible ? undefined : minHeight }}>
      {isVisible ? (
        <Suspense fallback={<div className="w-full" style={{ minHeight }} />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  );
}

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

const Index = () => {
  const { theme } = useSimpleTheme();
  const light = theme === "light";
  const { settings, detectedCity } = useLocalization();

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port : "";
  const isUSDomain =
    import.meta.env.MODE === "us" ||
    hostname.includes("emergencycontractors.net") ||
    ((hostname === "localhost" || hostname === "127.0.0.1") && port === "3001");
  const siteName = isUSDomain ? "Emergency Contractors" : "Emergency Tradesmen";
  const siteUrl = isUSDomain ? "https://emergencycontractors.net" : "https://emergencytradesmen.net";
  const siteTradeTerm = isUSDomain ? "Contractors" : "Tradesmen";
  const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== "UK" && detectedCity.toUpperCase() !== "UNITED KINGDOM" ? detectedCity : "Near You");

  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    name: `${siteName} ${displayCity}`,
    image: `${siteUrl}/assets/landing-hero/hero-01.webp`,
    description: `24/7 ${siteName} in ${displayCity}. Find public listings for local plumbers, electricians, locksmiths, roadside help, and more within minutes.`,
    contactPoint: {
      "@type": "ContactPoint",
      email: isUSDomain ? "emergencycontractor@outlook.com" : "emergencytradesmen@outlook.com",
      contactType: "emergency",
      availableLanguage: "English",
    },
    url: siteUrl,
    areaServed: displayCity,
    availableLanguage: "English",
    serviceType: ["Plumbing", "Electrical", "Locksmith", "HVAC", "Glazing", "Drainage", "Roadside Assistance"],
    openingHours: "Mo-Su 00:00-24:00",
    currenciesAccepted: settings.countryCode === "GB" ? "GBP" : "USD",
    paymentAccepted: "Cash, Credit Card, Debit Card",
    priceRange: settings.countryCode === "GB" ? "££" : "$$",
  };

  return (
    <>
      <GuestGate />
      <SEO
        title={`Emergency ${siteTradeTerm} Near You${displayCity !== "Near You" ? ` in ${displayCity}` : ""}`}
        description="Fast local emergency help for plumbing, electrical, locksmith, HVAC, roadside and urgent property repairs. Search by trade and area, then call a local expert directly."
        canonical="/"
        ogImage={`${siteUrl}/assets/landing-hero/hero-01.webp`}
        jsonLd={emergencyServiceSchema}
        alternates={[
          { lang: "en-GB", href: "https://emergencytradesmen.net/" },
          { lang: "en-US", href: "https://emergencycontractors.net/" },
          { lang: "x-default", href: "https://emergencytradesmen.net/" },
        ]}
      />

      <Header />
      <FloatingTourHub />
      <main className="min-h-screen bg-background">
        {/* Act 1: the emergency beam hero with the original dynamic headline */}
        <Hero3D mode={light ? "light" : "dark"} headline={<OriginalDynamicHeadline light={light} />} />

        {/* Act 2: the beam morphs into the guided scroll line under the hero. */}
        <GuidedStory light={light} displayCity={displayCity} isUSSite={isUSDomain} />
      </main>

      <DeferredSection minHeight={520}>
        <Footer />
      </DeferredSection>
    </>
  );
};

export default Index;
