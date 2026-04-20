import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { GuestGate } from "@/components/GuestGate";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";
import { FloatingTourHub } from "@/components/FloatingTourHub";

// Eager load Hero for LCP
import { HeroSection } from "@/components/sections/HeroSection";

// Lazy load other sections
const EmergencyServicesSection = lazy(() => import("@/components/sections/EmergencyServicesSection").then(module => ({ default: module.EmergencyServicesSection })));
const HowItWorksSection = lazy(() => import("@/components/sections/HowItWorksSection").then(module => ({ default: module.HowItWorksSection })));
const SEOContentSection = lazy(() => import("@/components/sections/SEOContentSection").then(module => ({ default: module.SEOContentSection })));
const BreakdownSection = lazy(() => import("@/components/sections/BreakdownSection").then(module => ({ default: module.BreakdownSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(module => ({ default: module.CTASection })));
const LatestBlogSection = lazy(() => import("@/components/sections/LatestBlogSection").then(module => ({ default: module.LatestBlogSection })));

const Index = () => {
  const { settings, detectedCity } = useLocalization();

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const port = typeof window !== 'undefined' ? window.location.port : '';
  const isUSDomain = hostname.includes('emergencycontractors.net') || (hostname === 'localhost' && port === '3001') || (hostname === '127.0.0.1' && port === '3001');
  const siteName = isUSDomain ? 'Emergency Contractors' : 'Emergency Tradesmen';
  const siteUrl = isUSDomain ? 'https://emergencycontractors.net' : 'https://emergencytradesmen.net';

  const displayCity = (detectedCity && detectedCity.length > 2 && detectedCity.toUpperCase() !== 'UK' && detectedCity.toUpperCase() !== 'UNITED KINGDOM' ? `in ${detectedCity}` : 'Near You');

  // Schema markup
  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    "name": `${siteName} ${displayCity}`,
    "image": `${siteUrl}/og-image.webp`,
    "description": `24/7 ${siteName} in ${displayCity}. Connect with verified local plumbers, electricians, locksmiths, and more within minutes.`,
    "contactPoint": {
      "@type": "ContactPoint",
      "email": isUSDomain ? "emergencycontractors@outlook.com" : "emergencytradesmen@outlook.com",
      "contactType": "emergency",
      "availableLanguage": "English"
    },
    "url": siteUrl,
    "areaServed": displayCity,
    "availableLanguage": "English",
    "serviceType": ["Plumbing", "Electrical", "Locksmith", "HVAC", "Glazing", "Drainage"],
    "openingHours": "Mo-Su 00:00-24:00",
    "currenciesAccepted": settings.countryCode === 'GB' ? "GBP" : "USD",
    "paymentAccepted": "Cash, Credit Card, Debit Card",
    "priceRange": settings.countryCode === 'GB' ? "££" : "$$",
    "potentialAction": {
      "@type": "ReserveAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/contact`,
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "result": {
        "@type": "Reservation",
        "name": "Emergency Service Booking"
      }
    }
  };

  return (
    <>
      <GuestGate />
      <SEO
        title={`Emergency ${settings.tradeTerm} Near You${displayCity !== 'Near You' ? ` in ${displayCity}` : ''}`}
        description={`Find trusted local ${settings.tradeTerm.toLowerCase()} in ${displayCity} for emergency repairs. Available 24/7 for plumbing, electrical, locksmith & HVAC. Call now to get connected with verified experts in your area today.`}
        canonical="/"
        ogImage={isUSDomain ? 'https://emergencycontractors.net/og-image.webp' : 'https://emergencytradesmen.net/tradesman-hero-v2.webp'}
        jsonLd={emergencyServiceSchema}
        alternates={[
          { lang: 'en-GB', href: 'https://emergencytradesmen.net/' },
          { lang: 'en-US', href: 'https://emergencycontractors.net/' },
          { lang: 'x-default', href: 'https://emergencytradesmen.net/' },
        ]}
      />

      <Header />
      <FloatingTourHub />
      <main className="min-h-screen bg-background">
        <HeroSection />

        <Suspense fallback={<div className="w-full min-h-[700px]" />}>
          <HowItWorksSection />
        </Suspense>

        <Suspense fallback={<div className="w-full min-h-[800px]" />}>
          <EmergencyServicesSection />
        </Suspense>

        <Suspense fallback={<div className="w-full min-h-[650px]" />}>
          <BreakdownSection />
        </Suspense>

        <Suspense fallback={<div className="w-full min-h-[1100px]" />}>
          <SEOContentSection />
        </Suspense>

        <Suspense fallback={<div className="w-full min-h-[500px]" />}>
          <LatestBlogSection />
        </Suspense>

        <Suspense fallback={<div className="w-full min-h-[500px]" />}>
          <CTASection />
        </Suspense>

        <div className="container mx-auto px-4 py-16">
          <HomeEmergencyAd />
        </div>

        {/* FAQ Section — visible by default for SEO and trust */}
        <div className="container mx-auto px-4 py-16 flex flex-col items-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Frequently Asked Questions</h2>
          <div className="w-full max-w-3xl">
            <GeneralFAQSection initiallyOpened={true} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Index;
