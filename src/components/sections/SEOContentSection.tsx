import { Zap } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { isUSDomain } from "@/lib/siteConfig";

export function SEOContentSection() {
    const { settings } = useLocalization();
    const us = isUSDomain();
    const tradeTerm = settings.tradeTerm.toLowerCase();

    return (
        <section className="container-wide pt-16 pb-8 md:py-16 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative max-w-5xl mx-auto bg-card/30 backdrop-blur-xl border border-white/8 rounded-3xl p-8 md:p-16 overflow-hidden shadow-lg group hover:border-gold/20 transition-colors duration-700">
                {/* Internal Shine Effects */}
                <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-gold/10 blur-[80px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-gold/5 blur-[80px] rounded-full opacity-30" />

                <div className="relative z-10 text-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold uppercase tracking-widest mb-8">
                        <Zap className="w-3 h-3 fill-gold" />
                        Public Business Listings
                    </span>

                    <h2 className="font-display text-3xl md:text-5xl text-foreground mb-8 leading-tight">
                        Why Choose Our <span className="text-gold">{settings.tradeTerm} Near Me?</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Card 1: Local Emergency Contacts */}
                        <div className="group/btn relative bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-gold/5 hover:border-gold/30 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/btn:opacity-100 transition-opacity">
                                <Zap className="w-4 h-4 text-gold" />
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                When you search for <strong>"{tradeTerm} near me"</strong>, you aren't just looking for a list of names—you need local emergency contacts you can check quickly before booking.
                            </p>
                        </div>

                        {/* Card 2: Instant Connectivity */}
                        <div className="group/btn relative bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-gold/5 hover:border-gold/30 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/btn:opacity-100 transition-opacity">
                                <Zap className="w-4 h-4 text-gold" />
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                Our network connects you instantly with the closest available <strong>local {tradeTerm}</strong> in your area. Finding reliable help in an emergency shouldn't be a gamble.
                            </p>
                        </div>

                        {/* Card 3: Complete Coverage */}
                        <div className="group/btn relative bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:bg-gold/5 hover:border-gold/30 transition-all duration-300 md:col-span-1">
                            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover/btn:opacity-100 transition-opacity">
                                <Zap className="w-4 h-4 text-gold" />
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                Whether it's a <strong>{us ? '24/7 emergency plumber' : '24/7 emergency plumber'}</strong>, a certified electrician, or a locksmith nearby, get the help you need, <strong>near you</strong>, right now.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
