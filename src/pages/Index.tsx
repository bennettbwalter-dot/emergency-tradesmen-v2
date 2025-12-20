import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { Header } from "@/components/Header";

import { Footer } from "@/components/Footer";

import { SearchForm } from "@/components/SearchForm";
import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";

import { TrustBadges } from "@/components/TrustBadges";

import { TradeCard } from "@/components/TradeCard";

import { EmergencyTriageModal } from "@/components/EmergencyTriageModal";

import { trades, cities } from "@/lib/trades";

import { Phone, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Link } from "react-router-dom";

import { motion } from "framer-motion";

import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";

import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { ChevronDown, ChevronUp } from "lucide-react";



const Index = () => {
  const [showFaq, setShowFaq] = useState(false);

  const organizationSchema = {

    "@context": "https://schema.org",

    "@type": "Organization",

    name: "Emergency Tradesmen UK",

    url: "https://emergencytrades.co.uk",

    logo: "https://emergencytrades.co.uk/et-logo-new.png",

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

    <ChatbotProvider>

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
                    <motion.span
                      animate={{ backgroundColor: ["#22C55E", "#EF4444"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    />
                    <motion.span
                      animate={{ backgroundColor: ["#22C55E", "#EF4444"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      className="relative inline-flex rounded-full h-2 w-2"
                    />
                  </span>

                  <motion.span animate={{ color: ["#FFFFFF", "#D4AF37"] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="text-sm font-medium uppercase tracking-wider">Tradespeople Available Now</motion.span>

                </motion.div>



                {/* Main headline */}

                <motion.h1

                  initial={{ opacity: 0, y: 30 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6, delay: 0.1 }}

                  className="mb-0"

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

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-base md:text-lg text-muted-foreground mb-4 max-w-2xl mx-auto"
                >
                  Find trusted local emergency tradespeople fast
                </motion.p>



                <motion.p

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6, delay: 0.3 }}

                  className="text-base text-muted-foreground/80 mb-2 max-w-2xl mx-auto"

                >

                  Describe your emergency or search and call immediately

                </motion.p>

              </div>



              <motion.div

                initial={{ opacity: 0, y: 30 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.7, delay: 0.4 }}

                className="mb-0"

              >


                <div className="w-full max-w-2xl mx-auto mb-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="rounded-3xl overflow-hidden">
                    <EmergencyChatInterface />
                  </div>
                </div>

                <SearchForm />

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



          {/* Breakdown Recovery Feature */}
          <section className="container-wide py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Image Side */}


              {/* Text Side */}
              <div className="order-1 lg:order-2">
                <p className="text-gold uppercase tracking-luxury text-sm mb-4">Roadside Assistance</p>
                <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 leading-tight">
                  Emergency <span className="text-gold">Breakdown Recovery</span> Available 24/7
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Vehicle trouble doesn't stick to business hours. Whether you're stuck at home or on the roadside, our verified recovery partners are just a tap away.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Nationwide coverage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Fast response times (30-60 mins)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Cars, vans, and light commercial</span>
                  </li>
                </ul>
                <Button size="xl" variant="hero" asChild>
                  <Link to="/breakdown/london">Get Roadside Help</Link>
                </Button>
              </div>
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



          <div className="container-wide pt-12">
            {/* Visibility Into Call-Outs Box for Tradesmen */}
            <div className="max-w-4xl mx-auto mb-16 p-8 rounded-3xl border border-gold/30 bg-gold/5 backdrop-blur-sm shadow-2xl overflow-hidden relative group">
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/10 rounded-full blur-[80px] group-hover:bg-gold/20 transition-colors duration-700" />

              <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
                <div className="text-left">
                  <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                    Turn <span className="text-gold">Visibility</span> Into <span className="text-gold">Call-Outs</span>
                  </h2>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <p className="text-foreground font-medium">Get seen first with priority ranking in your area</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <p className="text-foreground font-medium">Build instant trust with a ‘Featured’ badge and reviews</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <p className="text-foreground font-medium">Receive direct calls, not messages or time-wasters</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <p className="text-foreground font-medium">Reach customers ready to act, not just browsing</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1.5 w-5 h-5 rounded-full border border-gold/40 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                      </div>
                      <p className="text-foreground font-medium font-bold">No ads to manage. No chasing leads. Just calls.</p>
                    </li>
                  </ul>
                </div>

                {/* Empty Placeholder Image Area */}
                <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gold/20 bg-gold/5 flex items-center justify-center overflow-hidden hover:border-gold/40 transition-colors duration-500 group/placeholder">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-full border border-gold/20 flex items-center justify-center mx-auto mb-4 bg-gold/5 group-hover/placeholder:scale-110 transition-transform duration-500">
                      <Zap className="w-8 h-8 text-gold animate-pulse" />
                    </div>
                    <p className="text-gold/60 text-sm font-medium uppercase tracking-widest">Image Placeholder</p>
                    <p className="text-muted-foreground/60 text-xs mt-2">Space reserved for showcase visual</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

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







                {/* AI Triage CTA */}



                <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">

                  <AvailabilityCarousel />


                </div>



                <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">

                  Our team is standing by 24/7 to connect you with a local emergency tradesperson.

                  One call is all it takes.

                </p>



                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">



                  <Button variant="outline" size="xl" className="rounded-full" asChild>

                    <Link to="/contact" className="flex items-center gap-3">

                      <Phone className="w-5 h-5" />

                      Contact Us

                    </Link>

                  </Button>

                </div>

              </div>

            </div>

          </section>
          <div className="container mx-auto px-4 py-12 flex flex-col items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFaq(!showFaq)}
              className="rounded-full border-gold/30 hover:bg-gold/10 text-foreground px-12 font-bold"
            >
              FAQ
            </Button>

            {showFaq && (
              <div className="w-full max-w-3xl mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                <GeneralFAQSection initiallyOpened={true} />
              </div>
            )}
          </div>
        </main>



        <Footer />

      </>

    </ChatbotProvider>

  );

};



export default Index;
