import { useState, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { GuestGate } from "@/components/GuestGate";
import { AnimatePresence, motion } from "framer-motion";
import { HomeEmergencyAd } from "@/components/HomeEmergencyAd";
import { FloatingTourHub } from "@/components/FloatingTourHub";

// Eager load Hero for LCP
import { HeroSection } from "@/components/sections/HeroSection";

// Lazy load other sections
// Lazy load other sections
const EmergencyServicesSection = lazy(() => import("@/components/sections/EmergencyServicesSection").then(module => ({ default: module.EmergencyServicesSection })));
const SEOContentSection = lazy(() => import("@/components/sections/SEOContentSection").then(module => ({ default: module.SEOContentSection })));
const BreakdownSection = lazy(() => import("@/components/sections/BreakdownSection").then(module => ({ default: module.BreakdownSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(module => ({ default: module.CTASection })));

const Index = () => {
  const { settings, detectedCity } = useLocalization();
  const [showFaq, setShowFaq] = useState(false);

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
    "telephone": settings.countryCode === 'US' ? "+1-888-555-0199" : "+44 20 7946 0000",
    "areaServed": displayCity,
    "availableLanguage": "English",
    "serviceType": ["Plumbing", "Electrical", "Locksmith", "HVAC", "Glazing", "Drainage"],
    "openingHours": "Mo-Su 00:00-24:00",
    "currenciesAccepted": settings.countryCode === 'GB' ? "GBP" : "USD",
    "paymentAccepted": "Cash, Credit Card, Debit Card",
    "priceRange": settings.countryCode === 'GB' ? "££" : "$$",
  };

  return (
    <ChatbotProvider>
      <GuestGate />
      <SEO 
        title={`${siteName} ${displayCity}`}
        description={`Find trusted local ${settings.tradeTerm.toLowerCase()}s in ${displayCity} for emergency repairs. Available 24/7 for plumbing, electrical, locksmith, and HVAC. Fast response.`}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(emergencyServiceSchema)}
        </script>
        {/* Preload critical hero image/assets if needed */}
      </Helmet>

      <>
        <Header />
        <FloatingTourHub />
        <main className="min-h-screen bg-background">
          <HeroSection />

          <Suspense fallback={<div className="h-96 w-full" />}>
            <EmergencyServicesSection />
          </Suspense>

          <Suspense fallback={<div className="h-96 w-full" />}>
            <BreakdownSection />
          </Suspense>

          <Suspense fallback={<div className="h-96 w-full" />}>
            <SEOContentSection />
          </Suspense>

          <Suspense fallback={<div className="h-96 w-full" />}>
            <CTASection />
          </Suspense>

          <div className="container mx-auto px-4 py-16">
            <HomeEmergencyAd />
          </div>

          {/* FAQ Section */}
          <div className="container mx-auto px-4 py-16 flex flex-col items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFaq(!showFaq)}
              className="rounded-full border-gold/30 hover:bg-gold/10 text-foreground w-full max-w-md font-bold flex items-center justify-center gap-2"
            >
              FAQ
              {showFaq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            <AnimatePresence>
              {showFaq && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-3xl overflow-hidden"
                >
                  <div className="mt-8">
                    <GeneralFAQSection initiallyOpened={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
        <Footer />
      </>
    </ChatbotProvider>
  );
};

export default Index;
