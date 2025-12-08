import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { CTABanner } from "@/components/CTABanner";
import { TrustBadges } from "@/components/TrustBadges";
import { Button } from "@/components/ui/button";
import { generateTradePageData } from "@/lib/trades";
import { Phone, Clock, CheckCircle, MapPin, PoundSterling, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function TradeCityPage() {
  const { tradePath, city } = useParams<{ tradePath: string; city: string }>();
  
  if (!tradePath || !city) {
    return <Navigate to="/" replace />;
  }

  // Extract trade from path like "emergency-plumber" -> "plumber"
  const trade = tradePath.replace("emergency-", "");

  const pageData = generateTradePageData(trade, city);

  if (!pageData) {
    return <Navigate to="/" replace />;
  }

  const { 
    trade: tradeInfo, 
    city: cityName, 
    serviceAreas, 
    averageResponseTime, 
    emergencyPriceRange, 
    certifications, 
    services, 
    faqs 
  } = pageData;

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
    telephone: "0800 123 4567",
  };

  return (
    <>
      <Helmet>
        <title>Emergency {tradeInfo.name} in {cityName} – Open 24/7 | Fast Response</title>
        <meta 
          name="description" 
          content={`Need an emergency ${tradeInfo.name.toLowerCase()} in ${cityName}? Local experts available now. Average response ${averageResponseTime}. Call now.`}
        />
        <link rel="canonical" href={`https://emergencytrades.co.uk/emergency-${trade}/${city}`} />
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[60vh] flex items-center overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
          
          {/* Glow effects */}
          <div className="absolute top-10 right-10 w-72 h-72 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse" />
          
          <div className="relative container-wide py-16 md:py-24">
            <div className="max-w-3xl">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-muted-foreground text-sm mb-8">
                <Link to="/" className="hover:text-gold transition-colors">Home</Link>
                <span className="text-gold/50">/</span>
                <span className="text-foreground">Emergency {tradeInfo.name}</span>
                <span className="text-gold/50">/</span>
                <span className="text-gold">{cityName}</span>
              </nav>

              {/* Availability badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm mb-8 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-gold">{tradeInfo.name}s available now in {cityName}</span>
              </div>
              
              {/* Main headline */}
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
                  <a href="tel:08001234567" className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    Call Now: 0800 123 4567
                  </a>
                </Button>
                <div className="flex items-center gap-3 text-muted-foreground px-6 py-3 border border-border/50 rounded-sm">
                  <Clock className="w-5 h-5 text-gold" />
                  <span className="uppercase tracking-wider text-sm">Response in {averageResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section - Certifications */}
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
        <section className="container-wide py-16">
          <div className="text-center mb-10">
            <p className="text-gold uppercase tracking-luxury text-sm mb-4">What We Cover</p>
            <h2 className="font-display text-2xl md:text-4xl tracking-wide text-foreground">
              Emergency {tradeInfo.name} Services in {cityName}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group flex items-start gap-4 p-6 bg-card rounded-lg border border-border/50 hover:border-gold/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10 transition-colors">
                  <CheckCircle className="w-6 h-6 text-gold" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground tracking-wide">{service}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Available 24/7 with fast response times
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="container-wide py-6">
          <CTABanner trade={tradeInfo.name} city={cityName} />
        </section>

        {/* Local Coverage & Pricing */}
        <section className="container-wide py-16">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Areas Covered */}
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Areas We Cover Near {cityName}</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Our emergency {tradeInfo.name.toLowerCase()} network covers {cityName} and the surrounding areas, ensuring fast response times wherever you are.
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area} className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-sm text-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card rounded-lg border border-border/50 p-8 hover:border-gold/30 transition-colors">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full border border-gold/30 bg-gold/5 flex items-center justify-center">
                  <PoundSterling className="w-6 h-6 text-gold" />
                </div>
                <h2 className="font-display text-xl tracking-wide text-foreground">Transparent Pricing</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Emergency {tradeInfo.name.toLowerCase()} call-outs in {cityName} typically range from:
              </p>
              <div className="font-display text-4xl text-gold mb-6 tracking-wide">{emergencyPriceRange}</div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  No hidden charges
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  Price confirmed before work starts
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                  Weekend/evening rates may apply
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="container-wide">
          <FAQSection faqs={faqs} trade={tradeInfo.name} city={cityName} />
        </section>

        {/* Trust Badges */}
        <section className="container-wide py-16">
          <div className="text-center mb-10">
            <p className="text-gold uppercase tracking-luxury text-sm mb-4">Why Us</p>
            <h2 className="font-display text-2xl md:text-4xl tracking-wide text-foreground">
              Why Choose Our Emergency {tradeInfo.name} Service?
            </h2>
          </div>
          <TrustBadges />
        </section>

        {/* Final CTA */}
        <section className="container-wide py-16">
          <div className="relative text-center bg-card rounded-lg border border-gold/30 p-10 md:p-16 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            
            <div className="relative z-10">
              <p className="text-gold uppercase tracking-luxury text-sm mb-6">Get Help Now</p>
              <h2 className="font-display text-2xl md:text-4xl tracking-wide text-foreground mb-4">
                Call Now to Speak to an Emergency {tradeInfo.name} in {cityName}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Our lines are open 24 hours a day, 7 days a week. One quick call connects you with a local, verified professional.
              </p>
              <Button variant="hero" size="xl" asChild>
                <a href="tel:08001234567" className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  0800 123 4567
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}