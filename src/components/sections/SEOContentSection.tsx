import { Zap } from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";

export function SEOContentSection() {
    const { settings } = useLocalization();

    return (
        <section className="container-wide py-16 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold/5 blur-[120px] pointer-events-none rounded-full" />

            <div className="relative max-w-5xl mx-auto bg-card/30 backdrop-blur-xl border border-white/8 rounded-3xl p-8 md:p-16 overflow-hidden shadow-lg group hover:border-gold/20 transition-colors duration-700">
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
    );
}
