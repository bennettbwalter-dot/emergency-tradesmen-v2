import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { EmergencyChatInterface } from "@/components/EmergencyChatInterface";
import { TrustBadges } from "@/components/TrustBadges";
import { LayoutTextFlipDemo } from "@/components/LayoutTextFlipDemo";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { useLocalization } from "@/contexts/LocalizationContext";
import ColorBends from "@/components/ui/ColorBends";

export function HeroSection() {
    const { settings } = useLocalization();
    const location = useLocation();

    return (
        <section className="relative block overflow-hidden">
            {/* Background layers */}
            <div className="absolute inset-0 z-0 opacity-40">
                <ColorBends
                    colors={["#d7c08a", "#caa55b", "#b8986e"]}
                    rotation={0}
                    speed={0.2}
                    scale={1}
                    frequency={1}
                    warpStrength={1}
                    mouseInfluence={1}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0}
                />
            </div>

            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent pointer-events-none z-1" />

            {/* Decorative gold rings */}
            <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] -translate-y-1/2 opacity-20 animate-float pointer-events-none">
                <div className="absolute inset-0 rounded-full border border-gold/30" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
                <div className="absolute inset-8 rounded-full border border-gold/20" style={{ transform: 'rotateX(60deg) rotateZ(-30deg)' }} />
            </div>

            {/* Glow effects */}
            <div className="absolute -top-10 -right-10 md:top-20 md:right-20 w-80 h-80 md:w-96 md:h-96 bg-gold/5 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-gold/3 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative container-wide w-full pt-16 pb-0 md:pt-28 md:pb-0 pointer-events-none z-10">
                <div className="w-full max-w-5xl md:max-w-7xl mx-auto text-center pointer-events-auto">
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
                    </motion.div>

                    {/* Main headline */}
                    <h1 className="mb-0 font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide text-foreground mb-4 md:whitespace-nowrap">
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

                    {/* "Need Help" Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex justify-center mt-12 mb-0 md:mt-16 relative z-40"
                    >
                        <RainbowButton
                            size="lg"
                            className="gap-3 rounded-full font-display tracking-wider text-sm md:text-base px-8 py-3"
                            onClick={(e) => {
                                e.preventDefault();
                                window.dispatchEvent(new Event('start-tour'));
                            }}
                        >
                            <div className="relative flex items-center justify-center">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            NEED HELP?
                        </RainbowButton>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mb-0 mt-0 pointer-events-auto"
                >
                    <div className="w-full max-w-4xl mx-auto mb-0 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative z-30">
                        <div className="rounded-3xl overflow-visible">
                            <EmergencyChatInterface />
                        </div>
                    </div>
                </motion.div>

                {/* Flipping Text */}
                <div className="flex justify-center w-full relative z-20 pointer-events-auto mt-16 pb-16">
                    <LayoutTextFlipDemo />
                </div>
            </div>
        </section>
    );
}
