import { useState } from "react";
import { Helmet } from "react-helmet-async";

import { Header } from "@/components/Header";

import { Footer } from "@/components/Footer";


import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";

import { TrustBadges } from "@/components/TrustBadges";
import TrustpilotWidget from "@/components/TrustpilotWidget";

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

    url: "https://emergencytradesmen.net",

    logo: "https://emergencytradesmen.net/et-logo-new.png",

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

    url: "https://emergencytradesmen.net",

    potentialAction: {

      "@type": "SearchAction",

      target: "https://emergencytradesmen.net/{trade}/{city}",

      "query-input": "required name=trade name=city"

    }

  };



  return (

    <ChatbotProvider>

      <>

        <Helmet>

          <title>Emergency Tradesmen UK – VERIFIED 24/7 Plumbers</title>

          <meta

            name="description"

            content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK. Fast response, verified professionals."

          />

          <link rel="canonical" href="https://emergencytradesmen.net" />



          {/* Open Graph / Facebook */}

          <meta property="og:type" content="website" />

          <meta property="og:url" content="https://emergencytradesmen.net" />

          <meta property="og:title" content="Emergency Tradesmen UK – 24/7 Plumbers, Electricians & More" />

          <meta property="og:description" content="Find trusted emergency tradesmen near you. 24/7 plumbers, electricians, locksmiths & gas engineers across the UK." />

          <meta property="og:image" content="https://emergencytradesmen.net/og-image.jpg" />



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

          {/* Hero Section */}

          <section className="relative flex overflow-hidden">

            {/* Background layers */}

            <div className="absolute inset-0 bg-gradient-to-b from-background to-background" />

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />



            {/* Decorative gold rings */}

            <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 opacity-20 animate-float">

              <div className="absolute inset-0 rounded-full border border-gold/30" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />

              <div className="absolute inset-8 rounded-full border border-gold/20" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />

            </div>



            {/* Glow effects */}

            <div className="absolute top-20 right-20 w-96 h-96 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse" />

            <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/3 rounded-full blur-[80px]" />



            <div className="relative container-wide pt-6 pb-24 md:pt-12 md:pb-32">

              <div className="max-w-4xl mx-auto text-center">

                {/* Availability badge */}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mb-6 inline-flex flex-col items-center gap-2"
                >
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border-2 animate-border-gold-white bg-white/5 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 animate-pulse-red-green-bg"></span>
                    </span>
                    <span className="text-sm font-medium uppercase tracking-wider animate-pulse-gold-text">Tradespeople Available Now</span>
                  </div>

                  {/* Trustpilot Hero Widget */}
                  <TrustpilotWidget
                    templateId="5419b6a8b0d04a076446a9ad"
                    businessId="676878b2d4b2944b9e1e2c94"
                    username="emergencytradesmen.net"
                    styleHeight="24px"
                    className="mt-2"
                  />
                </motion.div>



                {/* Main headline */}

                <h1 className="mb-0 font-display text-3xl md:text-5xl lg:text-6xl tracking-wide text-foreground mb-4">
                  EMERGENCY <span className="text-gold">TRADESMEN</span>
                </h1>



                {/* Tagline */}

                <motion.p

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6, delay: 0.2 }}

                  className="text-lg md:text-xl text-muted-foreground mb-4 tracking-wide uppercase"

                >

                  When You Need Them Most

                </motion.p>



              </div>



              <motion.div

                initial={{ opacity: 0, y: 30 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.7, delay: 0.4 }}

                className="mb-0"

              >


                <div className="w-full max-w-4xl mx-auto mb-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <div className="rounded-3xl overflow-hidden">
                    <EmergencyChatInterface />
                  </div>
                </div>



              </motion.div>





            </div>

          </section>



          {/* Trust Badges */}

          <section className="container-wide pt-0 pb-16">

            <TrustBadges />

          </section>

          {/* How It Works Section */}
          <section className="container-wide py-16 border-t border-border/30">
            <div className="text-center mb-12">
              <p className="text-gold uppercase tracking-luxury text-sm mb-4">Simple Process</p>
              <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-4">
                How It Works
              </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-8 relative max-w-6xl mx-auto">

              {/* Step 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full md:w-[40%] flex flex-col items-center"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-lg shadow-gold/5 mb-6 group hover:border-gold/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-300 z-10 pointer-events-none" />
                  <img
                    src="/how-it-works-step-1.png"
                    alt="Step 1: Describe your problem or choose a trade"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                {/* Mobile Arrow */}
                <div className="flex md:hidden text-gold my-2 animate-bounce z-30 -mt-8 -mb-12">
                  <img src="/custom-arrow.png" alt="Next" className="w-24 h-24 object-contain rotate-90 drop-shadow-2xl" />
                </div>
              </motion.div>

              {/* Desktop Arrow 1 */}
              <div className="hidden md:flex shrink-0 z-20 -mx-20 relative">
                <img src="/custom-arrow.png" alt="Next" className="w-36 h-28 object-contain drop-shadow-md transform -rotate-12 hover:rotate-0 transition-transform duration-300" />
              </div>

              {/* Step 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full md:w-[20%] flex flex-col items-center"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-lg shadow-gold/5 mb-6 group hover:border-gold/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-300 z-10 pointer-events-none" />
                  <img
                    src="/how-it-works-step-2.png"
                    alt="Step 2: Choose a tradesman from the listings"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                {/* Mobile Arrow */}
                <div className="flex md:hidden text-gold my-2 animate-bounce z-30 -mt-8 -mb-12">
                  <img src="/custom-arrow.png" alt="Next" className="w-24 h-24 object-contain rotate-90 drop-shadow-2xl" />
                </div>
              </motion.div>

              {/* Desktop Arrow 2 */}
              <div className="hidden md:flex shrink-0 z-20 -mx-20 relative">
                <img src="/custom-arrow.png" alt="Next" className="w-36 h-28 object-contain drop-shadow-md transform -rotate-12 hover:rotate-0 transition-transform duration-300" />
              </div>

              {/* Step 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="w-full md:w-[30%] flex flex-col items-center"
              >
                <div className="relative rounded-2xl overflow-hidden border border-gold/20 shadow-lg shadow-gold/5 mb-6 group hover:border-gold/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gold/5 group-hover:bg-gold/10 transition-colors duration-300 z-10 pointer-events-none" />
                  <img
                    src="/how-it-works-step-3.png"
                    alt="Step 3: Contact via Call or WhatsApp"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
              </motion.div>

            </div>
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
                Available 24 hours a day, every day of the year.
              </p>

            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
              {trades.map((trade, index) => (
                <motion.div
                  key={trade.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${index % 2 !== 0 ? "mt-16 lg:mt-0" : ""} flex`}
                >
                  <div className="w-full h-full">
                    <TradeCard trade={trade} />
                  </div>
                </motion.div>
              ))}
            </div>

          </section>



          {/* Breakdown Recovery Feature */}
          <section className="container-wide pb-16 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Image Side */}
              <div className="order-2 lg:order-1 relative group">
                <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
                <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent z-10" />
                  <img
                    src="/emergency-breakdown-recovery.png"
                    alt="Emergency Breakdown Recovery at Night"
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="400"
                  />
                </div>
              </div>              {/* Text Side */}
              <div className="order-1 lg:order-2">
                <p className="text-gold uppercase tracking-luxury text-sm mb-4">Roadside Assistance</p>
                <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 leading-tight">
                  Emergency <span className="text-gold">Breakdown Recovery</span> Available 24/7
                </h2>
                <p className="text-muted-foreground text-xl mb-8">
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

                {/* Showcase Image Area */}
                <div className="relative aspect-[9/16] rounded-2xl border border-gold/20 bg-gold/5 flex items-center justify-center overflow-hidden hover:border-gold/40 transition-colors duration-500 shadow-2xl">
                  <img
                    src="/visibility-showcase.jpg"
                    alt="Visibility showcase"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
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
          <div className="container mx-auto px-4 pt-12 pb-2 flex flex-col items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFaq(!showFaq)}
              className="rounded-full border-gold/30 hover:bg-gold/10 text-foreground w-full max-w-md font-bold"
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



        {/* Center Trustpilot Carousel Widget */}
        <section className="container-wide pb-12 pt-0 border-t-0 border-border/30">
          <div className="max-w-6xl mx-auto">
            <TrustpilotWidget
              templateId="53aa8912dec7e10d38f59f36"
              businessId="676878b2d4b2944b9e1e2c94"
              username="emergencytradesmen.net"
              styleHeight="140px"
            />
          </div>
        </section>

        <Footer />

      </>

    </ChatbotProvider >

  );

};



export default Index;
