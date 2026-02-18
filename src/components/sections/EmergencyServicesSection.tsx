import { motion } from "framer-motion";
import { TradeCard } from "@/components/TradeCard";
import { trades } from "@/lib/trades";
import { useLocalization } from "@/contexts/LocalizationContext";

export function EmergencyServicesSection() {
    const { settings } = useLocalization();

    return (
        <section className="container-wide -mt-12 pb-16 relative z-20">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <div className="inline-block mb-4">
                    <span className="py-1 px-3 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-mono font-bold tracking-widest uppercase">
                        24/7 Rapid Response
                    </span>
                </div>
                <h2 className="font-display font-bold text-4xl md:text-6xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/50 mb-6 drop-shadow-sm">
                    Local Emergency {settings.tradeTerm} Near You
                </h2>

                <p className="text-muted-foreground/80 text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
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
    );
}
