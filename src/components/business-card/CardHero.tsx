import { Link } from "react-router-dom";
import { Shield, Siren } from "lucide-react";
import { Business, calculateTrustScore } from "@/lib/businesses";

interface CardHeroProps {
    business: Business;
}

export function CardHero({ business }: CardHeroProps) {
    const trustScore = calculateTrustScore(business);
    const isHighTrust = trustScore >= 4;

    return (
        <div className="group relative rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-white/5 px-5 py-4 flex flex-col justify-center gap-2 shadow-inner min-h-[5.5rem] transition-all duration-300 hover:border-zinc-700/50 hover:shadow-lg overflow-hidden mt-2">

            {/* Subtle background shine on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Title - Elegant Serif */}
            <h3 className="relative z-10 font-display font-medium text-[1.4rem] leading-tight text-white/90 truncate pr-2 tracking-wide text-shadow-sm group-hover:text-white transition-colors">
                <Link to={`/business/${business.id}`} className="hover:text-gold-light transition-colors">
                    {business.name}
                </Link>
            </h3>

            {/* Sub-details */}
            <div className="relative z-10 flex items-center gap-3 text-[10px] font-medium text-muted-foreground h-5 font-ui">
                {/* Trust Badge */}
                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                    <div className="relative flex items-center justify-center w-3.5 h-3.5">
                        <Shield className={`w-3.5 h-3.5 ${isHighTrust ? 'text-emerald-400 fill-emerald-400/10' : 'text-gold fill-gold/10'}`} strokeWidth={2.5} />
                    </div>
                    <span className={`${isHighTrust ? 'text-emerald-400/90' : 'text-gold-dark/90 font-bold'} tracking-wide`}>
                        TRUST SCORE {trustScore}/5
                    </span>
                </div>

                {/* Separator */}
                <span className="opacity-20">|</span>

                {/* Emergency Tag */}
                <div className="flex items-center gap-1 shrink-0">
                    <Siren className="w-3 h-3 text-red-500/80 animate-pulse" />
                    <span className="text-zinc-400 tracking-wide">Emergency Pro</span>
                </div>
            </div>
        </div>
    );
}
