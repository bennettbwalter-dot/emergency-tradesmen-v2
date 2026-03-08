import { Clock, ShieldCheck, MapPin } from "lucide-react";
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
        <section className="container-wide py-16">
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

                    <div className="mt-8 flex justify-center lg:justify-start">
                        <Button size="xl" variant="hero" asChild>
                            <Link to={`${settings.countryCode === 'GB' ? '' : '/us'}/emergency-breakdown/${settings.countryCode === 'GB' ? 'london' : 'los-angeles'}`}>Get Roadside Help</Link>
                        </Button>
                    </div>
                </div>

                {/* Text Side */}
                <div className="order-1 lg:order-2">
                    <p className="text-gold uppercase tracking-luxury text-sm mb-4">Roadside Assistance</p>
                    <h2 className="font-display text-3xl md:text-5xl text-foreground mb-6 leading-tight">
                        Emergency <span className="text-gold">{settings.towTerm}</span> Available 24/7
                    </h2>
                    <div className="space-y-8 mb-10">
                        {/* Feature 1: Always Online */}
                        <div className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover/item:border-gold/40 group-hover/item:bg-gold/20 transition-all duration-300">
                                <Clock className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="text-foreground font-bold text-lg mb-1">Always Online</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    24/7 support because vehicle trouble doesn't stick to business hours.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Verified Specialists */}
                        <div className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover/item:border-gold/40 group-hover/item:bg-gold/20 transition-all duration-300">
                                <ShieldCheck className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="text-foreground font-bold text-lg mb-1">Verified Specialists</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Connect instantly with vetted, insured, and professional {settings.towTerm.toLowerCase()} partners.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Rapid Response */}
                        <div className="flex gap-4 group/item">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover/item:border-gold/40 group-hover/item:bg-gold/20 transition-all duration-300">
                                <MapPin className="w-6 h-6 text-gold" />
                            </div>
                            <div>
                                <h3 className="text-foreground font-bold text-lg mb-1">Rapid Response</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Just a tap away, whether you're stuck at home or on the roadside.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Video Animation Scroll - Unified for all modes */}
            <TradesmenScroll />
        </section>
    );
}
