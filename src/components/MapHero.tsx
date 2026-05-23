import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Phone, Zap, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveMap } from "./LiveMap";
import { AvailabilityCarousel } from "./AvailabilityCarousel";
import { EmergencyChatInterface } from "./EmergencyChatInterface";
import { LayoutTextFlipDemo } from "./LayoutTextFlipDemo";
import Orb from "./ui/Orb";
import { useLocalization } from "@/contexts/LocalizationContext";

export const MapHero = () => {
    const { settings } = useLocalization();
    const location = useLocation();

    return (
        <section className="relative block overflow-hidden pt-24 md:pt-32 pb-0">
            {/* Background layers */}
            <div className="hidden md:block absolute left-0 right-0 bottom-0 top-[-200px] h-[calc(100%+200px)] md:inset-0 md:h-full z-0 pointer-events-auto">
                <Orb
                    hoverIntensity={2}
                    rotateOnHover
                    hue={0}
                    forceHoverState={false}
                    backgroundColor="#000000"
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent pointer-events-none" />

            {/* Content Container */}
            <div className="container-wide w-full relative z-10 grid lg:grid-cols-2 gap-0 lg:gap-12 items-center">

                {/* Left Column: Text & CTA */}
                <div className="text-center lg:text-left pt-6 pb-0 lg:pb-24 pointer-events-auto">
                    {/* Availability badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="mb-8 inline-flex flex-col items-center lg:items-start gap-2"
                    >
                        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full border-2 animate-border-gold-white bg-white/5 backdrop-blur-sm shadow-lg">
                            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 animate-pulse-red-green-bg"></span>
                            </span>
                            <span className="text-[10px] sm:text-sm font-medium uppercase tracking-wider animate-pulse-gold-text">Local {settings.tradeTerm} Available Now</span>
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-6 leading-tight"
                    >
                        LOCAL <span className="text-gold block lg:inline">{settings.tradeTerm.toUpperCase()} NEAR ME</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto lg:mx-0"
                    >
                        Emergency {settings.tradeTerm} {settings.countryCode === 'GB' ? 'UK' : 'US'} | Nationwide 24/7 Help.
                        <br className="hidden md:block" />
                        Find local emergency contacts fast. Confirm details directly before booking.
                    </motion.p>

                    {/* "Need Help" Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex justify-center lg:justify-start mb-6 mt-4 md:mt-6 md:mb-8"
                    >
                        <Link to={`${location.pathname}?tour=true`}>
                            <button className="relative group inline-flex items-center gap-2.5 px-6 py-2.5 bg-black/60 hover:bg-gold/10 border border-gold/40 hover:border-gold/80 rounded-full transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                                <div className="relative flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5 text-gold group-hover:scale-110 transition-transform duration-300" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full animate-ping" />
                                </div>
                                <span className="font-display font-medium tracking-wider text-[11px] text-white/90 group-hover:text-gold transition-colors">NEED HELP?</span>

                                {/* Internal Glow effect */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            </button>
                        </Link>
                    </motion.div>

                    {/* Chat Interface (Mobile: Below map, Desktop: Here) */}
                    <div className="hidden lg:block w-full max-w-2xl">
                        <EmergencyChatInterface />
                    </div>

                    {/* Mobile Chat Interface Placeholder - visible only on small screens below map */}
                </div>

                {/* Right Column: Live Map */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="relative lg:h-[600px] w-full flex items-center justify-center pointer-events-auto mt-4 lg:mt-0"
                >
                    <div className="relative w-full aspect-square lg:aspect-auto lg:h-full rounded-3xl overflow-hidden shadow-2xl border border-gold/20 bg-black/40 backdrop-blur-sm">
                        <LiveMap className="w-full h-full" zoom={13} />

                        {/* Overlay Card */}
                        <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl z-[400]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Average Response</span>
                                <span className="text-emerald-400 font-bold text-sm">~42 mins</span>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full w-[70%]" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Chat Interface (Visible on mobile below map) */}
                <div className="lg:hidden w-full col-span-1 mt-0 pointer-events-auto">
                    <EmergencyChatInterface />
                </div>
            </div>

            {/* Trust Badges & Flip Text */}
            <div className="container-wide pt-12 text-center relative z-20 pointer-events-auto">
                <LayoutTextFlipDemo />
            </div>
        </section>
    );
};
