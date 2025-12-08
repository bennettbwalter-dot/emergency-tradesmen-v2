import { Helmet } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchForm } from "@/components/SearchForm";
import { TrustBadges } from "@/components/TrustBadges";
import { TradeCard } from "@/components/TradeCard";
import { trades, cities } from "@/lib/trades";
import { Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Emergency Tradesmen UK – 24/7 Plumbers, Electricians & More</title>
        <meta 
          name="description" 
          content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK. Fast response, verified professionals."
        />
        <link rel="canonical" href="https://emergencytrades.co.uk" />
      </Helmet>

      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-2xl" />
          
          <div className="relative container-wide py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 text-success mb-6 animate-fade-up">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                </span>
                <span className="text-sm font-medium">Tradespeople available right now</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 animate-fade-up text-balance">
                Emergency Tradesmen
                <span className="block text-accent">When You Need Them Most</span>
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-fade-up-delay-1">
                24/7 verified plumbers, electricians, locksmiths & gas engineers. 
                Fast response across the UK. No call-out fee if we can't help.
              </p>
            </div>

            <div className="animate-fade-up-delay-2">
              <SearchForm />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-primary-foreground/70 text-sm animate-fade-up-delay-3">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                30-60 min response
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Fully insured
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                Transparent pricing
              </span>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="container-wide py-12 -mt-6 relative z-10">
          <TrustBadges />
        </section>

        {/* Emergency Services */}
        <section className="container-wide py-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Emergency Trade Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From burst pipes to power cuts, our verified professionals handle all urgent repairs. 
              Available 24 hours, every day of the year.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trades.map((trade) => (
              <TradeCard key={trade.slug} trade={trade} />
            ))}
          </div>
        </section>

        {/* Popular Cities */}
        <section className="bg-secondary py-12">
          <div className="container-wide">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">
              Find Emergency Help in Your City
            </h2>
            
            <div className="flex flex-wrap justify-center gap-3">
              {cities.slice(0, 20).map((city) => (
                <Link
                  key={city}
                  to={`/emergency-plumber/${city.toLowerCase()}`}
                  className="px-4 py-2 bg-card rounded-full border border-border text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
                >
                  {city}
                </Link>
              ))}
              <span className="px-4 py-2 text-sm text-muted-foreground">
                + {cities.length - 20} more cities
              </span>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-wide py-16">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Need Help Right Now?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
                Our team is standing by 24/7 to connect you with a local emergency tradesperson. 
                One call is all it takes.
              </p>
              
              <Button variant="hero" asChild>
                <a href="tel:08001234567" className="flex items-center gap-3">
                  <Phone className="w-5 h-5" />
                  Call Now: 0800 123 4567
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;
