import { useParams, Navigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { TrustBadges } from "@/components/TrustBadges";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessCardSkeleton } from "@/components/BusinessCardSkeleton";
import { SearchFilterBar } from "@/components/SearchFilterBar";
import { ReviewsSection } from "@/components/ReviewsSection";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateTradePageData, cities } from "@/lib/trades";
import { getBusinessListings } from "@/lib/businesses";
import { fetchBusinesses } from "@/lib/businessService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { useBusinessFilters } from "@/hooks/useBusinessFilters";
import { Phone, Clock, CheckCircle, MapPin, PoundSterling, Shield, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";
import type { Business } from "@/lib/businesses";
import { supabase } from "@/lib/supabase";
import { FloatingEmergencyCTA } from "@/components/FloatingEmergencyCTA";
import { TroubleshootingGuide } from "@/components/TroubleshootingGuide";
import { Zap, ArrowRight, Star } from "lucide-react";

export default function TradeCityPage() {
  const { tradePath, city } = useParams<{ tradePath: string; city: string }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract trade from path like "emergency-plumber" -> "plumber"
  const trade = tradePath ? tradePath.replace("emergency-", "") : "";

  const pageData = generateTradePageData(trade, city || "");

  const tradeInfo = pageData?.trade || { slug: '', name: 'Tradesperson', icon: '🔧' };
  const cityName = pageData?.city || 'your area';

  const serviceAreas = pageData?.serviceAreas || [];
  const averageResponseTime = pageData?.averageResponseTime || '30-90 minutes';
  const emergencyPriceRange = pageData?.emergencyPriceRange || '£75 - £150';
  const certifications = pageData?.certifications || [];
  const services = pageData?.services || [];
  const faqs = pageData?.faqs || [];

  // Map of trade-specific background images for hero
  const tradeHeroImages: Record<string, string> = {
    'plumber': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop',
    'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop',
    'locksmith': 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop',
    'gas-engineer': '/images/gas-engineer/gas-engineer-hero.webp',
    'drain-specialist': 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop',
    'glazier': '/images/glazier/glazier-hero.webp',
    'breakdown': '/images/breakdown-recovery/breakdown-hero.webp',
    'default': 'https://images.unsplash.com/photo-1469122312224-c5846569efe1?q=80&w=2070&auto=format&fit=crop'
  };

  const heroImage = tradeHeroImages[tradeInfo.slug] || tradeHeroImages.default;

  // Fetch real businesses from Supabase
  useEffect(() => {
    // Only fetch if we have valid data
    if (!tradeInfo.slug || !cityName || !pageData) return;

    async function loadBusinesses() {
      setIsLoading(true);
      try {
        const realBusinesses = await fetchBusinesses(tradeInfo.slug, cityName);

        // If no real businesses found, fallback to mock data
        if (realBusinesses.length === 0) {
          const mockBusinesses = getBusinessListings(cityName, tradeInfo.slug);
          setBusinesses(mockBusinesses || []);
        } else {
          setBusinesses(realBusinesses);
        }
      } catch (error) {
        console.error('Error loading businesses:', error);
        // Fallback to mock data on error
        const mockBusinesses = getBusinessListings(cityName, tradeInfo.slug);
        setBusinesses(mockBusinesses);
      } finally {
        setIsLoading(false);
      }
    }

    loadBusinesses();
  }, [tradeInfo.slug, cityName]);

  // Real-time updates for Availability
  useEffect(() => {
    const channel = supabase
      .channel('public:businesses')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'businesses' },
        (payload) => {
          console.log("Real-time update received:", payload);
          setBusinesses(current =>
            current.map(b =>
              b.id === payload.new.id
                // merge new data carefully, ensuring we keep any local specific fields if needed
                ? { ...b, ...payload.new }
                : b
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Apply filters and sorting
  const { filters, setFilters, filteredBusinesses, totalCount, resultsCount } =
    useBusinessFilters(businesses);

  // Early returns must happen AFTER hooks
  if (!tradePath || !city || !pageData) {
    return <Navigate to="/" replace />;
  }

  // Extract real verified reviews from the listings
  const realReviews = businesses
    .filter(b => b.featuredReview && b.rating >= 4.0)
    .slice(0, 8)
    .map((b) => ({
      id: `real-review-${b.id}`,
      businessId: b.id,
      userId: `user-${b.id}`,
      userName: "Verified Customer",
      userInitials: "VC",
      rating: b.rating,
      title: "Verified Google Review",
      comment: b.featuredReview!,
      date: new Date().toISOString(),
      verified: true,
      helpful: Math.floor(Math.random() * 5),
      notHelpful: 0,
    }));

  const reviewStats = calculateReviewStats(realReviews);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://emergencytradesmen.net/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}#localbusiness`,
    name: `Emergency ${tradeInfo.name} ${cityName}`,
    description: `24/7 emergency ${tradeInfo.name.toLowerCase()} services in ${cityName}. Fast response, fully insured professionals.`,
    image: heroImage,
    telephone: "020 3835 1566", // General contact or dynamic if available
    url: `https://emergencytradesmen.net/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: cityName,
      addressCountry: "GB"
    },
    geo: {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "addressCountry": "GB",
        "addressLocality": cityName
      },
      "geoRadius": "20000"
    },
    areaServed: {
      "@type": "City",
      name: cityName,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    priceRange: "££"
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://emergencytradesmen.net"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Locations",
        "item": "https://emergencytradesmen.net/locations"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${tradeInfo.name} in ${cityName}`,
        "item": `https://emergencytradesmen.net/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}`
      }
    ]
  };

  const seoTitle = pageData.problem
    ? `${pageData.problem.name} in ${cityName}`
    : `Emergency ${tradeInfo.name} ${cityName} – 24/7 Near Me | Arriving in ${averageResponseTime}`;

  const seoDescription = pageData.problem
    ? `${pageData.problem.description} ${cityName}. Available 24/7 with ${averageResponseTime} response time.`
    : `Need an emergency ${tradeInfo.name.toLowerCase()} in ${cityName}? Trusted local experts near you available 24/7. Average response ${averageResponseTime}. Call for help now.`;

  const seoKeywordsString = pageData.problem
    ? `${pageData.problem.slug}, ${cityName} ${pageData.problem.slug}, emergency ${tradeInfo.name.toLowerCase()}`
    : `emergency ${tradeInfo.name.toLowerCase()}, ${tradeInfo.name.toLowerCase()} ${cityName}, 24h ${tradeInfo.name.toLowerCase()} ${cityName}, emergency repairs ${cityName}, local tradesmen ${cityName}`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywordsString.split(', ')}
        canonical={`/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}`}
        ogImage={heroImage}
        jsonLd={[localBusinessSchema, faqSchema, breadcrumbSchema]}
      />

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt={pageData.problem ? `${pageData.problem.name} ${cityName}` : `Emergency ${tradeInfo.name} ${cityName}`}
              className="w-full h-full object-cover"
              fetchPriority="high"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
            <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
          </div>

          <div className="relative container-wide py-16 md:py-24 z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-2 text-muted-foreground/60 text-sm mb-8">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-gold/50">/</span>
                <span className="text-foreground/80">Emergency {tradeInfo.name}</span>
                <span className="text-gold/50">/</span>
                <span className="text-gold font-medium">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/50 bg-secondary/50 backdrop-blur-md mb-8 animate-fade-up shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-foreground">
                  {pageData.problem ? `${pageData.problem.name}s` : `${tradeInfo.name}s`} <span className="text-gold font-bold">available now</span> in {cityName}
                </span>
              </div>

              <h1 className="mb-6 animate-fade-up">
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-foreground mb-2 text-balance">
                  {pageData.problem ? pageData.problem.name : `Emergency ${tradeInfo.name}`}
                </span>
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-gold">
                  in {cityName}
                </span>
              </h1>

              <p className="text-lg text-foreground/80 mb-8 animate-fade-up-delay-1 max-w-2xl leading-relaxed font-light">
                Don't panic – help is on the way. Our network of local emergency {tradeInfo.name.toLowerCase()}s in {cityName} are ready to respond right now.
                With an average arrival time of {averageResponseTime}, you won't be waiting long. We only work with verified, fully insured professionals who deliver quality work at fair prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-delay-2">
                <Button
                  variant="hero"
                  onClick={() => {
                    document.getElementById('listings')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                  className="flex items-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  Contact Us
                </Button>
                <div className="flex items-center gap-3 text-foreground/70 px-6 py-3 border border-border/50 rounded-sm bg-secondary/30 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-wider text-sm font-bold">Response in {averageResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container-wide py-12">
          {pageData.localExpertise && (
            <div className="mb-12 p-6 bg-gold/5 border border-gold/20 rounded-xl animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 border border-gold/20 overflow-hidden shadow-md">
                  <img src="/et-logo-v2.png" alt="Emergency Tradesmen" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                    Local Intelligence: {cityName}

                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pageData.localExpertise}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-5 bg-card rounded-lg border border-border/50 hover:border-gold/30 transition-colors">
                <div className="w-10 h-10 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="container-wide py-16 bg-card/30">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-display text-foreground mb-4">{cityName} Emergency {tradeInfo.name} Services</h2>
            <p className="text-muted-foreground">Comprehensive emergency {tradeInfo.name.toLowerCase()} solutions for {cityName} and surrounding areas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border border-border/50 hover:border-gold/20 transition-all">
                <CheckCircle className="w-5 h-5 text-gold shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{service}</h3>
                  <p className="text-sm text-muted-foreground">Expert handling of all {service.toLowerCase()} situations.</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Listings Section */}
        <section className="container-wide py-16">
          <div className="mb-8">
            <SearchFilterBar
              filters={filters}
              onFiltersChange={setFilters}
              totalCount={totalCount}
              resultsCount={resultsCount}
            />
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Top Rated Local {tradeInfo.name}s Near {cityName}
            </h2>
            <p className="text-muted-foreground">
              Found {totalCount} verified professionals nearby
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div id="listings" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBusinesses.map((business, index) => (
                <BusinessCard key={business.id} business={business} rank={index + 1} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Banner */}
        <section className="container-wide py-6">
          <CTABanner trade={tradeInfo.name} city={cityName} />
        </section>

        {/* Coverage & Pricing */}
        <section className="container-wide py-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Areas We Cover Near {cityName}</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area, i) => {
                  const isCity = cities.includes(area as any);
                  if (isCity) {
                    return (
                      <Link
                        key={i}
                        to={`/emergency-${tradeInfo.slug}/${area.toLowerCase()}`}
                        className="px-3 py-1 bg-background rounded-full border border-border text-sm text-muted-foreground hover:bg-gold/10 hover:border-gold/30 hover:text-gold transition-colors"
                      >
                        {area}
                      </Link>
                    );
                  }
                  return (
                    <div key={i} className="px-3 py-1 bg-background rounded-full border border-border text-sm text-muted-foreground">
                      {area}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Emergency Rates</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Call Out Fee</span>
                  <span className="font-semibold text-foreground">Included</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border/50">
                  <span className="text-muted-foreground">Hourly Rate</span>
                  <span className="font-semibold text-foreground">{emergencyPriceRange}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Estimates</span>
                  <span className="font-semibold text-foreground">Free</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide py-16">
          <ReviewsSection
            reviews={realReviews}
            stats={reviewStats}
            businessName={`${tradeInfo.name} in ${cityName}`}
          />
        </section>

        <section className="container-wide py-16">
          <FAQSection
            faqs={faqs}
            trade={tradeInfo.name}
            city={cityName}
          />
        </section>

        {/* Troubleshooting Section */}
        <section className="container-wide py-16 bg-secondary/10">
          <TroubleshootingGuide trade={tradeInfo} city={cityName} />
        </section>

        {/* Professional Acquisition Section */}
        <section className="container-wide pb-24">
          <div className="relative rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/10 p-8 md:p-16">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-l from-gold/40 to-transparent"></div>
              <img
                src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2070&auto=format&fit=crop"
                alt="Professional Tradesperson"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 gold text-sm font-bold uppercase tracking-widest text-gold mb-6">
                Professional Network
              </div>
              <h2 className="text-3xl md:text-5xl font-display text-white mb-6 leading-tight">
                Are you a qualified <span className="text-gold">{tradeInfo.name}</span> in {cityName}?
              </h2>
              <p className="text-white/60 text-lg mb-10 leading-relaxed">
                Join the UK's fastest growing emergency trade network. Receive high-intent leads from customers in your area who need help right now.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="xl" className="bg-gold hover:bg-gold-light text-black font-bold px-8">
                  <Link to="/pricing">Join the Network</Link>
                </Button>
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-stone-800 flex items-center justify-center text-[10px] font-bold text-white">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs">
                    <div className="flex items-center gap-1 text-gold">
                      <Star className="w-3 h-3 fill-gold" />
                      <span className="font-bold">4.9/5</span>
                    </div>
                    <span className="text-white/40">Partner Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating CTA for Mobile Conversion */}
      <FloatingEmergencyCTA
        business={filteredBusinesses.find(b => b.is_premium) || filteredBusinesses[0]}
        trade={tradeInfo.name}
        city={cityName}
      />

      <WriteReviewModal
        businessName={`${tradeInfo.name} in ${cityName}`}
        businessId={`generic-${cityName}-${tradeInfo.slug}`}
      />
    </>
  );
}