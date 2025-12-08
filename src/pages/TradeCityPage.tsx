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
        <section className="relative bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative container-wide py-12 md:py-20">
            <div className="max-w-3xl">
              <nav className="flex items-center gap-2 text-primary-foreground/60 text-sm mb-6">
                <Link to="/" className="hover:text-primary-foreground">Home</Link>
                <span>/</span>
                <span className="text-primary-foreground">Emergency {tradeInfo.name}</span>
                <span>/</span>
                <span className="text-primary-foreground">{cityName}</span>
              </nav>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success mb-6 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-sm font-medium">{tradeInfo.name}s available now in {cityName}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6 animate-fade-up">
                Emergency {tradeInfo.name} in {cityName}
                <span className="block text-accent text-3xl md:text-4xl mt-2">Available Now – 24/7</span>
              </h1>
              
              <p className="text-lg text-primary-foreground/80 mb-8 animate-fade-up-delay-1 max-w-2xl">
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
                <div className="flex items-center gap-2 text-primary-foreground/70">
                  <Clock className="w-5 h-5" />
                  <span>Response in {averageResponseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="container-wide py-12 -mt-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border shadow-sm">
                <Shield className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm font-medium text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Services Section */}
        <section className="container-wide py-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Emergency {tradeInfo.name} Services We Cover in {cityName}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-accent/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-trust-light flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-trust" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{service}</h3>
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

        {/* Local Coverage */}
        <section className="container-wide py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-foreground">Areas We Cover Near {cityName}</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Our emergency {tradeInfo.name.toLowerCase()} network covers {cityName} and the surrounding areas, ensuring fast response times wherever you are.
              </p>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area} className="px-3 py-1 bg-secondary rounded-full text-sm text-foreground">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <PoundSterling className="w-6 h-6 text-accent" />
                <h2 className="text-xl font-bold text-foreground">Transparent Pricing</h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Emergency {tradeInfo.name.toLowerCase()} call-outs in {cityName} typically range from:
              </p>
              <div className="text-3xl font-bold text-foreground mb-4">{emergencyPriceRange}</div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  No hidden charges
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  Price confirmed before work starts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
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
        <section className="container-wide py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Why Choose Our Emergency {tradeInfo.name} Service?
          </h2>
          <TrustBadges />
        </section>

        {/* Final CTA */}
        <section className="container-wide py-12">
          <div className="text-center bg-secondary rounded-2xl p-8 md:p-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Call Now to Speak to an Emergency {tradeInfo.name} in {cityName}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Our lines are open 24 hours a day, 7 days a week. One quick call connects you with a local, verified professional.
            </p>
            <Button variant="cta" size="xl" asChild>
              <a href="tel:08001234567" className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                0800 123 4567
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
