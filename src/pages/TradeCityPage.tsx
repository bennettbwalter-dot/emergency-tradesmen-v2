import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
import { Button } from "@/components/ui/button";
import { generateTradePageData } from "@/lib/trades";
import { getBusinessListings } from "@/lib/businesses";
import { fetchBusinesses } from "@/lib/businessService";
import { generateMockReviews, calculateReviewStats } from "@/lib/reviews";
import { useBusinessFilters } from "@/hooks/useBusinessFilters";
import { Phone, Clock, CheckCircle, MapPin, PoundSterling, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { InteractiveMap } from "@/components/InteractiveMap";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";
import type { Business } from "@/lib/businesses";

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
  const averageResponseTime = pageData?.averageResponseTime || '30-60 minutes';
  const emergencyPriceRange = pageData?.emergencyPriceRange || '£75 - £150';
  const certifications = pageData?.certifications || [];
  const services = pageData?.services || [];
  const faqs = pageData?.faqs || [];

  // Map of trade-specific background images for hero
  const tradeHeroImages: Record<string, string> = {
    'plumber': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2070&auto=format&fit=crop',
    'electrician': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop',
    'locksmith': 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=2070&auto=format&fit=crop',
    'gas-engineer': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2070&auto=format&fit=crop',
    'drain-specialist': 'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=2070&auto=format&fit=crop',
    'glazier': 'https://images.unsplash.com/photo-1621350612918-0fb68bf71e1b?q=80&w=800&auto=format&fit=crop',
    'breakdown': 'https://images.unsplash.com/photo-1563229283-1419fba55a90?q=80&w=800&auto=format&fit=crop',
    'default': 'https://images.unsplash.com/photo-1469122312224-c5846569efe1?q=80&w=2070&auto=format&fit=crop'
  };

  const heroImage = tradeHeroImages[trade] || tradeHeroImages.default;

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
    name: `Emergency ${tradeInfo.name} ${cityName}`,
    description: `24/7 emergency ${tradeInfo.name.toLowerCase()} services in ${cityName}. Fast response, fully insured professionals.`,
    areaServed: {
      "@type": "City",
      name: cityName,
    },
    openingHours: "Mo-Su 00:00-23:59",
    email: "emergencytradesmen@outlook.com",
  };

  return (
    <>
      <Helmet>
        <title>Emergency {tradeInfo.name} in {cityName} – Open 24/7 | Fast Response</title>
        <meta
          name="description"
          content={`Need an emergency ${tradeInfo.name.toLowerCase()} in ${cityName}? Local experts available now. Average response ${averageResponseTime}. Call now.`}
        />
        <link rel="canonical" href={`https://emergencytrades.co.uk/emergency-${tradeInfo.slug}/${cityName.toLowerCase()}`} />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroImage}
              alt={`Emergency ${tradeInfo.name} ${cityName}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-primary/80 to-background" />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative container-wide py-16 md:py-24 z-10">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-gold/50">/</span>
                <span className="text-white">Emergency {tradeInfo.name}</span>
                <span className="text-gold/50">/</span>
                <span className="text-gold">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/50 bg-black/40 backdrop-blur-md mb-8 animate-fade-up shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-white">
                  {tradeInfo.name}s <span className="text-gold font-bold">available now</span> in {cityName}
                </span>
              </div>

              <h1 className="mb-6 animate-fade-up">
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-white mb-2">
                  Emergency {tradeInfo.name}
                </span>
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-gold">
                  in {cityName}
                </span>
              </h1>

              <p className="text-lg text-white/80 mb-8 animate-fade-up-delay-1 max-w-2xl leading-relaxed">
                Don't panic – help is on the way. Our network of trusted emergency {tradeInfo.name.toLowerCase()}s in {cityName} are ready to respond right now.
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
                <div className="flex items-center gap-3 text-white/70 px-6 py-3 border border-white/20 rounded-sm bg-white/5 backdrop-blur-sm">
                  <Clock className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-wider text-sm font-bold">Response in {averageResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container-wide py-12">
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
            <h2 className="text-3xl font-display text-foreground mb-4">Services We Provide</h2>
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
              Top Rated {tradeInfo.name}s in {cityName}
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
                {serviceAreas.map((area, i) => (
                  <div key={i} className="px-3 py-1 bg-background rounded-full border border-border text-sm text-muted-foreground">
                    {area}
                  </div>
                ))}
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
      </main>

      <Footer />
      <WriteReviewModal
        businessName={`${tradeInfo.name} in ${cityName}`}
        businessId={`generic-${cityName}-${tradeInfo.slug}`}
      />
    </>
  );
}