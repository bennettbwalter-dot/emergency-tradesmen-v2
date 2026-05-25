import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, PhoneCall, ShieldCheck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Header } from "@/components/Header";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GuestGate } from "@/components/GuestGate";
import { LandingHeroCarousel } from "@/components/sections/LandingHeroCarousel";

import { EmergencyServicesSection } from "@/components/sections/EmergencyServicesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { SEOContentSection } from "@/components/sections/SEOContentSection";
import { BreakdownSection } from "@/components/sections/BreakdownSection";

const CTASection = lazy(() =>
  import("@/components/sections/CTASection").then((module) => ({ default: module.CTASection }))
);
const LatestBlogSection = lazy(() =>
  import("@/components/sections/LatestBlogSection").then((module) => ({ default: module.LatestBlogSection }))
);
const HomeEmergencyAd = lazy(() =>
  import("@/components/HomeEmergencyAd").then((module) => ({ default: module.HomeEmergencyAd }))
);
const GeneralFAQSection = lazy(() =>
  import("@/components/GeneralFAQSection").then((module) => ({ default: module.GeneralFAQSection }))
);
const Footer = lazy(() => import("@/components/Footer").then((module) => ({ default: module.Footer })));

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

/**
 * Scroll-triggered fade-in wrapper.
 * Adds `.is-visible` to a `.landing-fade-in` element when it enters the viewport.
 */
function FadeInSection({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px", threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="landing-fade-in">
      {children}
    </div>
  );
}

const Index = () => {
  const { settings, detectedCity, geoError, detectUserLocation, isLocating } = useLocalization();

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const port = typeof window !== "undefined" ? window.location.port : "";
  const isUSDomain =
    import.meta.env.MODE === "us" ||
    hostname.includes("emergencycontractors.net") ||
    (hostname === "localhost" && port === "3001") ||
    (hostname === "127.0.0.1" && port === "3001");
  const isUSSite = settings.countryCode === "US" || isUSDomain;
  const siteCountryLabel = isUSSite ? "US" : "UK";
  const siteName = isUSSite ? "Emergency Contractors" : "Emergency Tradesmen";
  const siteUrl = isUSSite ? "https://emergencycontractors.net" : "https://emergencytradesmen.net";
  const siteTradeTerm = isUSSite ? "Contractors" : "Tradesmen";
  const singularTradeTerm = isUSSite ? "contractor" : "tradesman";
  const normalisedDetectedCity = detectedCity?.trim() ?? "";
  const hasLiveCity =
    normalisedDetectedCity.length > 2 &&
    ![
      "GB",
      "GREAT BRITAIN",
      "UK",
      "UNITED KINGDOM",
      "US",
      "USA",
      "UNITED STATES",
      "UNITED STATES OF AMERICA",
    ].includes(normalisedDetectedCity.toUpperCase());
  const displayCity =
    hasLiveCity
      ? normalisedDetectedCity
      : "Near You";
  const heroCity = hasLiveCity ? normalisedDetectedCity.toUpperCase() : "ME";
  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    name: `${siteName} ${displayCity}`,
    image: `${siteUrl}/assets/landing-hero/hero-01.webp`,
    description: `24/7 ${siteName} in ${displayCity}. Find public listings for local plumbers, electricians, locksmiths, roadside help, and more within minutes.`,
    contactPoint: {
      "@type": "ContactPoint",
      email: isUSSite ? "emergencycontractors@outlook.com" : "emergencytradesmen@outlook.com",
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
    <ChatbotProvider>
      <GuestGate />
      <SEO
        title={`Emergency ${siteTradeTerm} Near You${displayCity !== "Near You" ? ` in ${displayCity}` : ""}`}
        description="Fast local emergency help for plumbing, electrical, locksmith, HVAC, roadside and urgent property repairs. Search by trade and area, then call a local expert directly."
        canonical="/landing"
        ogImage={`${siteUrl}/assets/landing-hero/hero-01.webp`}
        jsonLd={emergencyServiceSchema}
        alternates={[
          { lang: "en-GB", href: "https://emergencytradesmen.net/" },
          { lang: "en-US", href: "https://emergencycontractors.net/" },
          { lang: "x-default", href: "https://emergencytradesmen.net/" },
        ]}
      />

      <Header showDesktopSidebar={false} />
      <main className="landing-2026-page min-h-screen bg-background">
        <section className="landing-2026-hero">
          <div className="landing-2026-hero__shell">
            <div className="landing-2026-hero__copy">
              <div className="landing-2026-badge">
                <span aria-hidden="true" />
                Local professionals available now
              </div>

              <h1
                className="landing-2026-local-title"
                aria-label={`Local ${siteTradeTerm} near ${heroCity}`}
              >
                <span className="landing-2026-local-title__local">
                  L
                  <img
                    src="/et-logo-v3.webp"
                    alt=""
                    aria-hidden="true"
                    width="64"
                    height="64"
                    decoding="async"
                    className="landing-2026-local-title__logo"
                  />
                  CAL
                </span>
                <span className="landing-2026-local-title__trade">
                  {siteTradeTerm.toUpperCase()}
                </span>
                <span className="landing-2026-local-title__near">
                  <span>near</span>
                  <strong>{heroCity}</strong>
                </span>
              </h1>

              {geoError && (
                <button
                  type="button"
                  onClick={detectUserLocation}
                  className="landing-2026-geo-error"
                >
                  {isLocating ? "Checking precise phone location..." : geoError}
                </button>
              )}

              <p className="landing-2026-hero__lede">
                <strong>{siteName} {siteCountryLabel} | Nationwide 24/7 Help</strong>
                <span>
                  Search the main site by trade and area, check local public listings, and call a nearby emergency {singularTradeTerm} or roadside expert quickly.
                </span>
              </p>

              <div className="landing-2026-hero__actions" aria-label="Primary landing page actions">
                <Link to="/" className="landing-2026-button landing-2026-button--primary">
                  Find emergency help
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/register" className="landing-2026-button">
                  Sign up your business
                </Link>
              </div>

              <div className="landing-2026-hero__proof" aria-label="Website benefits">
                <span>
                  <MapPin className="h-4 w-4" />
                  Trade and area search
                </span>
                <span>
                  <PhoneCall className="h-4 w-4" />
                  Direct local contact
                </span>
                <span>
                  <ShieldCheck className="h-4 w-4" />
                  Public business listings
                </span>
              </div>
            </div>

            <LandingHeroCarousel className="landing-2026-hero__visual" />
          </div>
        </section>

        <FadeInSection>
          <HowItWorksSection />
        </FadeInSection>

        <FadeInSection>
          <EmergencyServicesSection />
        </FadeInSection>

        <FadeInSection>
          <BreakdownSection compact={true} />
        </FadeInSection>

        <FadeInSection>
          <SEOContentSection />
        </FadeInSection>

        <FadeInSection>
          <DeferredSection minHeight={420}>
            <LatestBlogSection />
          </DeferredSection>
        </FadeInSection>

        <FadeInSection>
          <DeferredSection minHeight={400}>
            <CTASection />
          </DeferredSection>
        </FadeInSection>

        <FadeInSection>
          <div className="landing-ad-wrap">
            <DeferredSection minHeight={280}>
              <HomeEmergencyAd />
            </DeferredSection>
          </div>
        </FadeInSection>

        <FadeInSection>
          <div className="landing-faq-wrap">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="w-full max-w-3xl mx-auto">
              <DeferredSection minHeight={320}>
                <GeneralFAQSection initiallyOpened={true} />
              </DeferredSection>
            </div>
          </div>
        </FadeInSection>
      </main>
      <DeferredSection minHeight={520}>
        <Footer />
      </DeferredSection>
    </ChatbotProvider>
  );
};

export default Index;
