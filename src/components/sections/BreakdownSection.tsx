import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";
import { TradesmenScroll } from "@/components/animations/TradesmenScroll";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function BreakdownSection() {
    const { settings } = useLocalization();
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isLight = resolvedTheme === 'light';

    return (
        <section className="container-wide pb-16 pt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Image Side */}
                <div className="order-2 lg:order-1 relative group">
                    <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-700" />
                    <div className="relative rounded-3xl overflow-hidden border border-gold/20 shadow-lg">
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
                </div>

                {/* Text Side */}
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
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="xl" variant="hero" asChild>
                            <Link to={`${settings.countryCode === 'GB' ? '' : '/us'}/emergency-breakdown/${settings.countryCode === 'GB' ? 'london' : 'los-angeles'}`}>Get Roadside Help</Link>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Premium Video Animation Scroll - Unified for all modes */}
            <TradesmenScroll />
        </section>
    );
}
