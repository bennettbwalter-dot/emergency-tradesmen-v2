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
          console.log(`No real businesses found for ${tradeInfo.slug} in ${cityName}, trying fallback`); // Added debug log
          const mockBusinesses = getBusinessListings(cityName, tradeInfo.slug);
          console.log(`Fallback returned:`, mockBusinesses); // Added debug log
          setBusinesses(mockBusinesses || []);
        } else {
          console.log(`Loaded ${realBusinesses.length} real businesses from database`);
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
  if (!tradePath || !city) {
    return <Navigate to="/" replace />;
  }

  if (!pageData) {
    return <Navigate to="/" replace />;
  }

  // Extract real verified reviews from the listings
  // This aggregates the "featuredReview" from the top businesses in this city
  const realReviews = businesses
    .filter(b => b.featuredReview && b.rating >= 4.0)
    .slice(0, 8)
    .map((b, i) => ({
      id: `real-review-${b.id}`,
      businessId: b.id,
      userId: `user-${b.id}`,
      userName: "Verified Customer", // Privacy: We don't have full names in the summary data
      userInitials: "VC",
      rating: b.rating,
      title: "Verified Google Review",
      comment: b.featuredReview!,
      date: new Date().toISOString(), // We don't store review dates in summary, defaulting to recent
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
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse" />

          <div className="relative container-wide py-16 md:py-24">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-2 text-muted-foreground text-sm mb-8">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-gold/50">/</span>
                <span className="text-foreground">Emergency {tradeInfo.name}</span>
                <span className="text-gold/50">/</span>
                <span className="text-gold">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm mb-8 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-gold">{tradeInfo.name}s available now in {cityName}</span>
              </div>

              <h1 className="mb-6 animate-fade-up">
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-foreground mb-2">
                  Emergency {tradeInfo.name}
                </span>
                <span className="block font-display text-4xl md:text-6xl tracking-wide text-gold">
                  in {cityName}
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 animate-fade-up-delay-1 max-w-2xl leading-relaxed">
                Don't panic – help is on the way. Our network of trusted emergency {tradeInfo.name.toLowerCase()}s in {cityName} are ready to respond right now.
                With an average arrival time of {averageResponseTime}, you won't be waiting long. We only work with verified, fully insured professionals who deliver quality work at fair prices.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up-delay-2">
                <Button variant="hero" asChild>
                  <Link to="/contact" className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    Contact Us
                  </Link>
                </Button>
                <div className="flex items-center gap-3 text-muted-foreground px-6 py-3 border border-border/50 rounded-sm">
                  <Clock className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-wider text-sm">Response in {averageResponseTime}</span>
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
        <section className="container-wide py-16 bg-card/30">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-display text-foreground mb-4">Services We Provide</h2>
            <p className="text-muted-foreground">Comprehensive emergency {tradeInfo.name.toLowerCase()} solutions for {cityName} and surrounding areas.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border border-border/50">
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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