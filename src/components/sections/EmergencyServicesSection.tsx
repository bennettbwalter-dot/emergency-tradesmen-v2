import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TradeCard } from "@/components/TradeCard";
import { trades } from "@/lib/trades";
import { useLocalization } from "@/contexts/LocalizationContext";
import FlowingMenu from "../FlowingMenu";
import { ArrowLeft } from "lucide-react";
import { SVGTrustBadges } from "../SVGTrustBadges";

// Use the official trades list for consistency and full data (icons, images, names)
const menuItems = trades.map(t => ({
    ...t,
    text: t.name // FlowingMenu expects 'text'
}));

export function EmergencyServicesSection() {
    const { settings } = useLocalization();
    const [activeTrade, setActiveTrade] = useState<string | null>(null);
    const soloViewRef = useRef<HTMLDivElement>(null);

    const selectedTrade = activeTrade ? trades.find(t => t.slug === activeTrade) : null;

    // Auto-scroll the trade card into view when selected
    useEffect(() => {
        if (activeTrade) {
            // Wait for the AnimatePresence exit (500ms) to finish before scrolling
            const timer = setTimeout(() => {
                soloViewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [activeTrade]);

    const handleTradeSelect = (slug: string) => {
        setActiveTrade(slug);
    };

    const handleBack = () => {
        setActiveTrade(null);
    };

    return (
        <section className="container-wide py-16 relative z-20 min-h-[800px]">
            <AnimatePresence mode="wait">
                {!activeTrade ? (
                    <motion.div
                        key="menu-view"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="text-center mb-16">
                            <div className="w-full max-w-5xl mx-auto px-4 animate-fade-up flex flex-col items-center py-0 overflow-visible group">
                                <SVGTrustBadges />
                            </div>
                        </div>

                        <div style={{ height: '500px', position: 'relative' }} className="mb-0">
                            <FlowingMenu items={menuItems}
                                speed={15}
                                textColor="hsl(var(--foreground))"
                                bgColor="transparent"
                                marqueeBgColor="hsl(var(--foreground))"
                                marqueeTextColor="hsl(var(--background))"
                                borderColor="hsl(var(--border))"
                                onTradeSelect={handleTradeSelect}
                            />
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        ref={soloViewRef}
                        key="solo-view"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                        className="flex flex-col items-center justify-center px-4 md:px-0 py-12 relative"
                    >
                        <button
                            onClick={handleBack}
                            className="group flex items-center gap-2 text-muted-foreground hover:text-white transition-colors mb-12"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:border-gold/50 transition-all">
                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            </div>
                            <span className="font-display tracking-widest text-sm uppercase group-hover:text-gold transition-colors">
                                Back to All Services
                            </span>
                        </button>

                        <div className="w-full max-w-lg shadow-[0_0_50px_rgba(212,175,55,0.15)] rounded-2xl">
                            {selectedTrade && <TradeCard trade={selectedTrade} />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
