import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { TrustBadges } from "@/components/TrustBadges";
import { TradeCard } from "@/components/TradeCard";
import { EmergencyTriageModal } from "@/components/EmergencyTriageModal";
import { trades, cities } from "@/lib/trades";
import { Phone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";

const Index = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Emergency Tradesmen UK",
    url: "https://emergencytrades.co.uk",
    logo: "https://emergencytrades.co.uk/logo.png",
    description: "Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "emergencytradesmen@outlook.com",
      contactType: "customer service",
      availableLanguage: "English"
    },
    sameAs: []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Emergency Tradesmen UK",
    url: "https://emergencytrades.co.uk",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://emergencytrades.co.uk/{trade}/{city}",
      "query-input": "required name=trade name=city"
    }
  };

  return (
    <>
      <Helmet>
        <title>Emergency Tradesmen UK – 24/7 Plumbers, Electricians & More</title>
        <meta
          name="description"
          content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK. Fast response, verified professionals."
        />
        <link rel="canonical" href="https://emergencytrades.co.uk" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://emergencytrades.co.uk" />
        <meta property="og:title" content="Emergency Tradesmen UK – 24/7 Plumbers, Electricians & More" />
        <meta property="og:description" content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK." />
        <meta property="og:image" content="https://emergencytrades.co.uk/og-image.jpg" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Emergency Tradesmen UK – 24/7 Plumbers, Electricians & More" />
        <meta name="twitter:description" content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers." />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />

          {/* Decorative gold rings */}
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 opacity-20 animate-float">
            <div className="absolute inset-0 rounded-full border border-gold/30" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
            <div className="absolute inset-8 rounded-full border border-gold/20" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
          </div>

          {/* Glow effects */}
          <div className="absolute top-20 right-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/3 rounded-full blur-[80px]" />

          <div className="relative container-wide py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Availability badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-gold/30 bg-gold/5 backdrop-blur-sm mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                </span>
                <span className="text-sm font-medium uppercase tracking-wider text-gold">Tradespeople Available Now</span>
              </motion.div>

              {/* Main headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-8"
              >
                <span className="block font-display text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground mb-4">
                  EMERGENCY
                </span>
                <span className="block font-display text-5xl md:text-7xl lg:text-8xl tracking-wide text-gold">
                  TRADESMEN
                </span>
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mb-4 tracking-wide uppercase"
              >
                When You Need Them Most
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base text-muted-foreground/80 mb-12 max-w-2xl mx-auto"
              >
                24/7 verified plumbers, electricians, locksmiths & gas engineers.
                Fast response across the UK. No call-out fee if we can't help.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mb-8"
            >
              <SearchForm />
            </motion.div>

            {/* AI Triage CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center mb-12"
            >
              <EmergencyTriageModal
                trigger={
                  <Button variant="outline" size="lg" className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold">
                    <Zap className="w-5 h-5 mr-2" />
                    Not sure what you need? Get Help Now
                  </Button>
                }
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm"
            >
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                30-60 min response
              </span>
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                Fully insured
              </span>
              <span className="flex items-center gap-2 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                Transparent pricing
              </span>
            </motion.div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="container-wide py-16">
          <TrustBadges />
        </section>

        {/* Emergency Services */}
        <section className="container-wide py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-gold uppercase tracking-luxury text-sm mb-4">Our Expertise</p>
            <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-4">
              Emergency Trade Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From burst pipes to power cuts, our verified professionals handle all urgent repairs.
              Available 24 hours, every day of the year.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trades.map((trade, index) => (
              <motion.div
                key={trade.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TradeCard trade={trade} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Popular Cities */}
        <section className="py-16 border-t border-b border-border/30">
          <div className="container-wide">
            <div className="text-center mb-10">
              <p className="text-gold uppercase tracking-luxury text-sm mb-4">Coverage</p>
              <h2 className="font-display text-2xl md:text-4xl tracking-wide text-foreground">
                Find Emergency Help in Your City
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {cities.slice(0, 20).map((city) => (
                <Link
                  key={city}
                  to={`/emergency-plumber/${city.toLowerCase()}`}
                  className="px-5 py-2.5 bg-card rounded-full border border-border/50 text-sm font-medium text-foreground hover:border-gold/50 hover:text-gold hover:bg-gold/5 transition-all duration-300"
                >
                  {city}
                </Link>
              ))}
              <span className="px-5 py-2.5 text-sm text-muted-foreground">
                + {cities.length - 20} more cities
              </span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-wide py-20">
          <div className="relative overflow-hidden rounded-lg border border-gold/30 bg-card p-10 md:p-16 text-center">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

            <div className="relative z-10">
              <p className="text-gold uppercase tracking-luxury text-sm mb-6">24/7 Availability</p>
              <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-6">
                Need Help Right Now?
              </h2>

              <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">
                <AvailabilityCarousel />
              </div>

              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                Our team is standing by 24/7 to connect you with a local emergency tradesperson.
                One call is all it takes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <EmergencyTriageModal
                  trigger={
                    <Button variant="hero" size="xl">
                      <Zap className="w-5 h-5 mr-2" />
                      Get Help Now
                    </Button>
                  }
                />
                <Button variant="outline" size="xl" asChild>
                  <a href="mailto:emergencytradesmen@outlook.com" className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    Email Us
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;