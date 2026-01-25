import { useParams, Navigate, useLocation } from "react-router-dom";
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
import { generateTradePageData, cities, usCities, cityToState } from "@/lib/trades";
import { US_STATES } from "@/lib/us_states";
import { getPostcodeForCity } from "@/lib/cityPostcodes";
import { getBusinessListings } from "@/lib/businesses";
import { fetchBusinesses } from "@/lib/businessService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { useBusinessFilters } from "@/hooks/useBusinessFilters";
import { Phone, Clock, CheckCircle, MapPin, PoundSterling, DollarSign, Shield, Navigation } from "lucide-react";
import { Link } from "react-router-dom";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";
import type { Business } from "@/lib/businesses";
import { supabase } from "@/lib/supabase";
import { FloatingEmergencyCTA } from "@/components/FloatingEmergencyCTA";
import { TroubleshootingGuide } from "@/components/TroubleshootingGuide";
import { Zap, ArrowRight, Star } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function TradeCityPage() {
  const { countryCode, tradePath, city, state, area, metro, suburb } = useParams<{
    countryCode: string;
    tradePath: string;
    city: string;
    state?: string;
    area?: string;
    metro?: string;
    suburb?: string;
  }>();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const location = useLocation();

  // Debug Params
  console.log("TradeCityPage Debug:", {
    path: location.pathname,
    params: { countryCode, tradePath, city, state, area, metro, suburb }
  });

  // Resolution Logic for Hierarchy
  const rawTargetLocation = suburb || area || city || metro || state;
  // CRITICAL FIX: Default to 'London' (or National) if no city provided to prevent crash
  let validCity = rawTargetLocation ? decodeURIComponent(rawTargetLocation) : (countryCode === 'US' ? 'New York' : 'London');

  // FIX: US Routing Ambiguity
  // If tradePath matches a known US state (e.g. /us/texas/dallas matched as :tradePath/:city),
  // treat it as state, not trade.
  let effectiveTradePath = tradePath;
  let effectiveState = state;

  if (!effectiveState && effectiveTradePath && US_STATES.some(s => s.slug === effectiveTradePath)) {
    effectiveState = effectiveTradePath;
    effectiveTradePath = undefined;
  }

  // Resolution Logic for Trade
  let validTrade = effectiveTradePath ? effectiveTradePath.replace("emergency-", "") : "default";

  // Fallback for explicit routes (e.g. /emergency-plumber/:city) where tradePath param is missing from useParams
  if (validTrade === "default") {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    // Find the segment that looks like a trade (starts with emergency- or matches a known trade)
    const tradeSegment = pathSegments.find(s => s.startsWith('emergency-') || ['plumber', 'electrician', 'locksmith'].includes(s));

    if (tradeSegment) {
      validTrade = tradeSegment.replace("emergency-", "");
    }
  }

  // Handle /us/ca/los-angeles legacy ambiguity if needed, but new router prevents most.
  // We keep it simple: Trust params.

  const country = countryCode?.toUpperCase() || (location.pathname.startsWith('/us') ? 'US' : 'GB');

  // Pass state and metro context to generator for strict lookup
  const pageData = generateTradePageData(
    validTrade,
    validCity,
    country,
    effectiveState,
    metro
  );

  // Normalize cities for check (handles hyphens from URL)
  const normalizedCitiesGB = cities.map(c => c.toLowerCase().replace(/\s+/g, '-'));
  // We can't just check usCities array anymore because it doesn't contain suburbs
  // We rely on generateTradePageData to have validated it, or we need a robust check.
  // Since pageData is already generated above using generateTradePageData(..., validCity, ...),
  // we can check if pageData was successfully returned and what country it thinks it is.

  // However, we need to know if it's supposed to be US or GB for the Redirect logic below.
  // If pageData exists, we can trust it?

  // Let's make a more robust check using our Knowledge Base (or us_cities.json implicitly available via imports in trades.ts but not here directly efficiently)
  // Actually, we can use the `pageData` result. generateTradePageData returns null if not found.
  // But wait, generateTradePageData might return data even if not found if we passed 'US' as countryCode (it falls back to input name).

  // Let's assume if the route is /us/..., we are looking for US.
  // The redirect logic below deals with "Region Mismatch".

  const isCityUS = countryCode === 'us' || (pageData && pageData.city && usCities.includes(pageData.city)) || false;
  // This is imperfect. Better:

  // If we are in /us route, we assume US.
  // If we are in /... (GB) route, we assume GB.
  // The Mismatch logic tries to catch: user goes to /london (GB) but london is US? No.
  // It catches: user goes to /us/london (if london is GB only) -> Redirect to /london.

  // Ideally we use `getLocationIndex` but that's overkill to import here if we can avoid it.
  // Let's rely on simple heuristic + explicit countryCode param.

  // Region Mismatch / Redirects
  // We trust the URL structure for Country determination.
  // /us/... -> US
  // /... -> GB
  const actualCountry = (location.pathname.startsWith('/us') || countryCode?.toLowerCase() === 'us' || pageData?.countryCode === 'US') ? 'US' : 'GB';

  // Only redirect if there is a glaring mismatch (e.g. city definitely wrong?)
  // For now, removing strict redirect allows new US locations to work without "white-listing" in trades.ts
  // Old logic removed.

  const tradeInfo = pageData?.trade || { slug: validTrade, name: validTrade || 'Tradesperson', icon: '🔧' };
  const cityName = pageData?.city || validCity || (countryCode?.toUpperCase() === 'US' ? 'United States' : 'United Kingdom');

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

  // Prefer image from trade config (trades.ts) if available, otherwise fallback to local map
  const heroImage = pageData?.problem?.image || (tradeInfo as any).image || tradeHeroImages[tradeInfo.slug] || tradeHeroImages.default;

  // Fetch real businesses from Supabase
  useEffect(() => {
    // Only fetch if we have valid data
    // Only fetch if we have valid data
    // Fetches using raw validCity to support generic (empty) queries
    if (!tradeInfo.slug) return;

    async function loadBusinesses() {
      setIsLoading(true);
      try {
        console.log('Fetching businesses for:', { trade: tradeInfo.slug, city: validCity, countryCode: actualCountry });
        const realBusinesses = await fetchBusinesses(tradeInfo.slug, validCity, actualCountry);
        console.log('Real businesses fetched:', realBusinesses.length);

        // If no real businesses found, fallback to static/mock data (now strictly limited)
        if (realBusinesses.length === 0) {
          console.warn('No real businesses found. Checking static list...');
          const staticBusinesses = getBusinessListings(validCity, tradeInfo.slug, actualCountry);
          console.log('Static businesses found:', staticBusinesses?.length);
          setBusinesses(staticBusinesses || []);
        } else {
          setBusinesses(realBusinesses);
        }
      } catch (error) {
        console.error('Error loading businesses:', error);
        // Fallback to static list on error
        const staticBusinesses = getBusinessListings(cityName, tradeInfo.slug, actualCountry);
        setBusinesses(staticBusinesses || []);
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

  // Pagination Logic
  const totalPages = Math.ceil(resultsCount / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentBusinesses = filteredBusinesses.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, city, tradePath]);

  // Early returns must happen AFTER hooks
  const validatedTradePath = tradeInfo.slug;
  if (!validatedTradePath) {
    console.warn("TradeCityPage: Missing tradePath, redirecting home.", { validatedTradePath });
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
      title: "Verified Review",
      comment: b.featuredReview!,
      date: new Date().toISOString(),
      verified: true,
      helpful: Math.floor(Math.random() * 5),
      notHelpful: 0,
    }));

  const reviewStats = calculateReviewStats(realReviews);

  const postcode = getPostcodeForCity(cityName);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `https://emergencytradesmen.net/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}#localbusiness`,
    name: `Emergency ${tradeInfo.name} ${cityName}`,
    description: `24/7 emergency ${tradeInfo.name.toLowerCase()} services in ${cityName}. Fast response, fully insured professionals.`,
    image: heroImage,
    telephone: countryCode?.toUpperCase() === 'US' ? "+1 323-555-0123" : "+1 555-0123-456", // General contact or dynamic if available
    url: `https://emergencytradesmen.net/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}`,
    "serviceType": `Emergency ${tradeInfo.name}`,
    "provider": {
      "@type": "Organization",
      "name": `Emergency Tradesmen ${countryCode?.toUpperCase() === 'US' ? 'US' : 'UK'}`,
      "url": "https://emergencytradesmen.net"
    },

    areaServed: {
      "@type": "City",
      name: cityName,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": cityName,
        "addressCountry": countryCode?.toUpperCase() || "GB",
        ...(postcode ? { "postalCode": postcode } : {})
      }
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": `${tradeInfo.name} Services`,
      "itemListElement": services.map((service) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service
        }
      }))
    }
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

  const seoTitle = pageData?.problem
    ? `${pageData.problem.name} in ${cityName}`
    : `Emergency ${tradeInfo.name} ${cityName} – 24/7 Near Me | Arriving in ${averageResponseTime}`;

  const seoDescription = pageData?.problem
    ? `${pageData.problem.description} ${cityName}. Available 24/7 with ${averageResponseTime} response time.`
    : `Need an emergency ${tradeInfo.name.toLowerCase()} in ${cityName}? Trusted local experts near you available 24/7. Average response ${averageResponseTime}. Call for help now.`;

  const seoKeywordsString = pageData?.problem
    ? `${pageData.problem.slug}, ${cityName} ${pageData.problem.slug}, emergency ${tradeInfo.name.toLowerCase()}`
    : `emergency ${tradeInfo.name.toLowerCase()}, ${tradeInfo.name.toLowerCase()} ${cityName}, 24h ${tradeInfo.name.toLowerCase()} ${cityName}, emergency repairs ${cityName}, local tradesmen ${cityName}`;

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywordsString.split(', ')}
        canonical={actualCountry === 'US'
          ? `/us/emergency-${tradeInfo.slug}/${cityName.toLowerCase().replace(/\s+/g, '-')}`
          : `/emergency-${tradeInfo.slug}/${cityName.toLowerCase().replace(/\s+/g, '-')}`
        }
        ogImage={heroImage}
        jsonLd={[serviceSchema, faqSchema, breadcrumbSchema]}
      />



      <Header countryCode={actualCountry} />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt={pageData?.problem ? `${pageData.problem.name} ${cityName}` : `Emergency ${tradeInfo.name} ${cityName}`}
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
                  {pageData?.problem ? `${pageData.problem.name}s` : `${tradeInfo.name}s`} <span className="text-gold font-bold">available now</span> in {cityName}
                </span>
              </div>

              <h1 className="mb-6 animate-fade-up">
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-foreground mb-2 text-balance">
                  {pageData?.problem ? pageData.problem.name : `Emergency ${tradeInfo.name}`}
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
          {pageData?.localExpertise && (
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

          {/* Coverage Map Section */}
          <div className="mb-12 h-[450px] rounded-2xl overflow-hidden border border-border/50 shadow-2xl relative group">
            <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 text-sm font-medium">
              Real-time local coverage: {cityName}
            </div>
            <InteractiveMap
              city={cityName}
              countryCode={actualCountry}
              showBusinesses={true}
              businesses={businesses}
              className="w-full h-full"
            />
          </div>

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
              Found {totalCount} available experts nearby {resultsCount > 50 && `(Showing top 50)`}
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <BusinessCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <>
                {businesses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 bg-muted/10 rounded-xl border-2 border-dashed border-border/50 text-center">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4">
                      <Clock className="w-8 h-8 text-gold" />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-2">Listings coming soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We're currently expanding our network of {tradeInfo.name.toLowerCase()} professionals in {cityName}.
                      Check back soon or try a nearby location.
                    </p>
                  </div>
                ) : (
                  <div id="listings" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {currentBusinesses.map((business, index) => (
                      <BusinessCard key={business.id} business={business} rank={startIndex + index + 1} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <Pagination className="mb-16">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Smart pagination logic to show relevant pages
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) {
                            pageNum = currentPage - 2 + i;
                          }
                          if (pageNum > totalPages) {
                            pageNum = totalPages - (4 - i);
                          }
                        }

                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              isActive={currentPage === pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            </>
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
                  {actualCountry === 'US' ? (
                    <DollarSign className="w-6 h-6 text-gold" />
                  ) : (
                    <PoundSterling className="w-6 h-6 text-gold" />
                  )}
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
                Join the fastest growing emergency trade network. Receive high-intent leads from customers in your area who need help right now.
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

      <Footer countryCode={actualCountry} />

      {/* Floating CTA for Mobile Conversion */}
      <FloatingEmergencyCTA
        business={filteredBusinesses.find(b => b.is_premium) || filteredBusinesses[0]}
        trade={tradeInfo.name}
        city={cityName}
        countryCode={actualCountry}
      />

      <WriteReviewModal
        businessName={`${tradeInfo.name} in ${cityName}`}
        businessId={`generic-${cityName}-${tradeInfo.slug}`}
      />
    </>
  );
}