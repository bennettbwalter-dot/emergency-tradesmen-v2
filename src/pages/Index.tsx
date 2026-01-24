import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";


import { Header } from "@/components/Header";

import { Footer } from "@/components/Footer";


import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";

import { TrustBadges } from "@/components/TrustBadges";
import TrustpilotWidget from "@/components/TrustpilotWidget";

import { TradeCard } from "@/components/TradeCard";

import { EmergencyTriageModal } from "@/components/EmergencyTriageModal";




import { trades, cities, usCities } from "@/lib/trades";

import { Phone, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import Orb from "@/components/ui/Orb";
import Carousel from "@/components/ui/Carousel";
import { FiCircle, FiCode, FiFileText, FiLayers, FiLayout } from 'react-icons/fi';
import { AnimatedBeamDemo } from "@/components/AnimatedBeamDemo";
import { LayoutTextFlipDemo } from "@/components/LayoutTextFlipDemo";

import { Link, useParams } from "react-router-dom";

import { motion } from "framer-motion";

import { AvailabilityCarousel } from "@/components/AvailabilityCarousel";

import { ChatbotProvider } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { GeneralFAQSection } from "@/components/GeneralFAQSection";
import { ChevronDown, ChevronUp } from "lucide-react";
import { GuestGate } from "@/components/GuestGate";
import { useIsMobile } from "@/hooks/use-mobile";




const Index = () => {
  const { settings } = useLocalization();
  const [showFaq, setShowFaq] = useState(false);
  const [showAllCities, setShowAllCities] = useState(false);
  const isMobile = useIsMobile();


  const emergencyServiceSchema = {
    "@context": "https://schema.org",
    "@type": "EmergencyService",
    "@id": "https://emergencytradesmen.net/#organization",
    "name": `Emergency ${settings.tradeTerm} ${settings.countryCode === 'GB' ? 'UK' : 'US'}`,
    "url": "https://emergencytradesmen.net",
    "logo": "https://emergencytradesmen.net/et-logo-new.png",
    "description": `24/7 emergency ${settings.tradeTerm.toLowerCase()} services including plumbing, electrical, locksmithing, and gas engineering.`,
    "telephone": settings.countryCode === 'GB' ? "+443333333333" : "+18005550199",
    "areaServed": settings.countryCode,
    "availableLanguage": "English",
    "currenciesAccepted": settings.currencyCode,
    "paymentAccepted": "Cash, Credit Card, Debit Card",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Emergency Trade Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Plumbing"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Electrician"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Locksmith"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Emergency Gas Engineer"
          }
        }
      ]
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "emergencytradesmen@outlook.com",
      "contactType": "customer service",
      "availableLanguage": "English"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": `Emergency ${settings.tradeTerm} ${settings.countryCode === 'GB' ? 'UK' : 'US'}`,
    "url": "https://emergencytradesmen.net",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://emergencytradesmen.net/{trade}/{city}",
      "query-input": "required name=trade name=city"
    }
  };

  const { countryCode } = useParams<{ countryCode: string }>();

  return (
    <ChatbotProvider>
      <>
        <GuestGate />

        <SEO
          title={`Emergency ${settings.tradeTerm} Near Me – Local 24/7 Plumbers, Electricians & Locksmiths`}
          description={`Looking for emergency ${settings.tradeTerm.toLowerCase()} near you? We connect you with local, verified 24/7 plumbers, electricians & locksmiths. Fast 30-90 min response.`}
          keywords={[
            "tradesmen near me",
            "local emergency plumber",
            "24 hour electrician near me",
            "emergency locksmith near me",
            "emergency gas engineer",
            "24/7 tradesmen",
            "local emergency trades"
          ]}
          jsonLd={[emergencyServiceSchema, websiteSchema]}
        />

        <Header countryCode={countryCode} />



        <main>

          {/* Hero Section */}

          {/* Hero Section */}

          <section className="relative block overflow-hidden">


            {/* Background layers */}

            <div className="absolute left-0 right-0 bottom-0 top-[-200px] h-[calc(100%+200px)] md:inset-0 md:h-full z-0 pointer-events-auto">
              <Orb
                hoverIntensity={2}
                rotateOnHover
                hue={0}
                forceHoverState={false}
                backgroundColor="#000000"
              />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />





            {/* Decorative gold rings */}

            <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 opacity-20 animate-float pointer-events-none">

              <div className="absolute inset-0 rounded-full border border-gold/30" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />

              <div className="absolute inset-8 rounded-full border border-gold/20" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />

            </div>



            {/* Glow effects  */}

            <div className="absolute -top-10 -right-10 md:top-20 md:right-20 w-80 h-80 md:w-96 md:h-96 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />

            <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/3 rounded-full blur-[80px] pointer-events-none" />



            <div className="relative container-wide w-full pt-6 pb-0 md:pt-12 md:pb-0 pointer-events-none z-10">

              <div className="max-w-4xl mx-auto text-center pointer-events-auto">

                {/* Availability badge */}

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="mb-6 inline-flex flex-col items-center gap-2"
                >
                  <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-2 animate-border-gold-white bg-white/5 backdrop-blur-sm">
                    <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse-red-green-bg"></span>
                    </span>
                    <span className="text-[10px] sm:text-sm font-medium uppercase tracking-wider animate-pulse-gold-text">Local {settings.tradeTerm} Available Now</span>
                  </div>

                  {/* Trustpilot Hero Widget removed due to invalid ID */}
                </motion.div>



                {/* Main headline */}

                <h1 className="mb-0 font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-wide text-foreground mb-4 md:whitespace-nowrap">
                  LOCAL <span className="text-gold">{settings.tradeTerm.toUpperCase()} NEAR ME</span>
                </h1>



                {/* Tagline */}

                <motion.p

                  initial={{ opacity: 0, y: 20 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ duration: 0.6, delay: 0.2 }}

                  className="text-[10px] sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-4 tracking-wide uppercase"

                >

                  Emergency {settings.tradeTerm} {settings.countryCode === 'GB' ? 'UK' : 'US'} | Nationwide 24/7 Help

                </motion.p>



              </div>



              <motion.div

                initial={{ opacity: 0, y: 30 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ duration: 0.7, delay: 0.4 }}

                className="mb-0 pointer-events-auto"

              >


                <div className="w-full max-w-4xl mx-auto mb-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-30">
                  <div className="rounded-3xl overflow-hidden">
                    <EmergencyChatInterface />
                  </div>
                </div>




              </motion.div>

              {/* Header for Trust Badges */}
              <div className="mt-16 text-center relative z-20 pointer-events-auto">
                <h2 className="font-display text-2xl md:text-4xl tracking-wide text-foreground mb-6">
                  Our Local Tradesmen Are
                </h2>
              </div>

              {/* Trust Badges */}
              <section className="container-wide pt-0 pb-8 mt-12 relative z-20">
                <TrustBadges />
              </section>

              {/* Flipping Text */}
              <div className="flex justify-center w-full relative z-20 pointer-events-auto pb-16">
                <LayoutTextFlipDemo />
              </div>

            </div>

          </section>











          {/* How It Works Section */}

          <section className="container-wide py-16 border-t border-border/30">
            <div className="text-center mb-12">
              <p className="text-gold uppercase tracking-luxury text-sm mb-4">Simple Process</p>
              <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-4">
                How to Find a {settings.tradeTerm} Near You
              </h2>
            </div>

            {/* Carousel Integration */}
            <div className="flex justify-center w-full mb-16 relative z-20 pointer-events-auto">
              <div className="relative h-[240px] md:h-[400px]">
                <Carousel
                  items={[
                    {
                      title: 'Picture Connect',
                      description: 'Seamlessly connect with tradesmen via images.',
                      id: 0,
                      icon: <FiLayers className="h-4 w-4 text-white" />,
                      videoSrc: "/picture-connect.mp4"
                    },
                    {
                      title: 'Drop-Down Connect',
                      description: 'Easy selection process for your specific needs.',
                      id: 0.1,
                      icon: <FiLayers className="h-4 w-4 text-white" />,
                      videoSrc: "/drop-down.mp4"
                    },
                    {
                      title: 'Describe Problem',
                      description: 'Type out your issue for quick matching.',
                      id: 0.2,
                      icon: <FiFileText className="h-4 w-4 text-white" />,
                      videoSrc: "/type.mp4"
                    },
                    {
                      title: 'Voice Agent',
                      description: 'Use voice commands to find help.',
                      id: 0.3,
                      icon: <FiCircle className="h-4 w-4 text-white" />,
                      videoSrc: "/voice.mp4"
                    },
                    {
                      title: 'Coming Soon',
                      description: 'More helpful guides are on the way.',
                      id: 1,
                      icon: <FiCode className="h-[16px] w-[16px] text-white" />
                    }
                  ]}
                  baseWidth={isMobile ? 340 : 640} /* Responsive width: 340px for mobile, 640px for desktop */
                  autoplay={false}
                  autoplayDelay={3000}
                  pauseOnHover={false}
                  loop={false}
                  round={false}
                />
              </div>
            </div>



          </section>



          {/* Emergency Services */}

          <section className="container-wide -mt-12 pb-16 relative z-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-5xl tracking-wide text-foreground mb-4">
                Local Emergency {settings.tradeTerm} Near You
              </h2>

              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From burst pipes to power cuts, our verified local professionals handle all urgent repairs.
                Available 24 hours a day, near you, every day of the year.
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



          {/* SEO Content Block: Tradesmen Near Me - Premium Glassmorphism */}
          <section className="container-wide py-16 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative max-w-5xl mx-auto bg-card/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-16 overflow-hidden shadow-2xl group hover:border-gold/20 transition-colors duration-700">
              {/* Internal Shine Effects */}
              <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-gold/10 blur-[80px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
              <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-gold/5 blur-[80px] rounded-full opacity-30" />

              <div className="relative z-10 text-center">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest mb-8">
                  <Zap className="w-3 h-3 fill-gold" />
                  Verified Local Network
                </span>

                <h2 className="font-display text-3xl md:text-5xl text-foreground mb-8 leading-tight">
                  Why Choose Our <span className="text-gold">{settings.tradeTerm} Near Me?</span>
                </h2>

                <div className="prose prose-lg prose-invert mx-auto text-muted-foreground/90 leading-relaxed max-w-3xl">
                  <p className="mb-6">
                    When you search for <strong>"tradesmen near me"</strong>, you aren't just looking for a list of names—you need verified local experts who can arrive within minutes, not days. Finding reliable help in an emergency shouldn't be a gamble.
                  </p>
                  <p>
                    Our network connects you instantly with the closest available <strong>local tradesmen</strong> in your area. Whether it's a 24/7 emergency plumber, a certified electrician, or a locksmith nearby, we ensure every professional is vetted, insured, and ready to deploy. Don't settle for "available someday"—get the help you need, <strong>near you</strong>, right now.
                  </p>
                </div>

                <div className="mt-10 flex justify-center">
                  <div className="h-1 w-24 bg-gradient-to-r from-transparent via-gold/50 to-transparent rounded-full" />
                </div>
              </div>
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
                    src="/emergency-breakdown-recovery.webp"
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
                  Emergency <span className="text-gold">{settings.towTerm}</span> Available 24/7
                </h2>
                <p className="text-muted-foreground text-xl mb-8">
                  Vehicle trouble doesn't stick to business hours. Whether you're stuck at home or on the roadside, our verified {settings.towTerm.toLowerCase()} partners are just a tap away.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Nationwide coverage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Fast response times (30-90 mins)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    <span className="text-foreground">Cars, vans, and light commercial</span>
                  </li>
                </ul>
                <Button size="xl" variant="hero" asChild>
                  <Link to={`${settings.countryCode === 'GB' ? '' : '/us'}/emergency-breakdown/${settings.countryCode === 'GB' ? 'london' : 'los-angeles'}`}>Get Roadside Help</Link>
                </Button>
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



        {/* Trustpilot Carousel removed due to invalid ID */}

        <Footer />

      </>

    </ChatbotProvider >

  );

};



export default Index;
