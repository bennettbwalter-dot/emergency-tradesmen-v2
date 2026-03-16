import { Link } from "react-router-dom";
import { Shield, Siren } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business, calculateTrustScore } from "@/lib/businesses";

interface CardHeroProps {
    business: Business;
    isParchment?: boolean;
}

export function CardHero({ business, isParchment }: CardHeroProps) {
    const trustScore = calculateTrustScore(business);
    const isHighTrust = trustScore >= 4;

    return (
        <div className={cn(
            "group relative rounded-none border-b-2 border-dashed border-[#2a1b0a]/20 px-5 py-4 flex flex-col justify-center gap-2 transition-all duration-300 min-h-[5.5rem] mt-2 overflow-hidden bg-transparent shadow-none"
        )}>

            {/* Subtle background shine on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Title - Elegant Serif or Western Slab */}
            <h3 className={cn(
                "relative z-10 leading-tight pr-2 tracking-wide transition-colors font-serif font-black text-[1.5rem] text-[#2a1b0a] uppercase [text-shadow:1px_1px_0px_rgba(42,27,10,0.1)] break-words hover:text-[#2a1b0a]/80"
            )}>
                <Link to={`/business/${business.id}`} className="transition-colors">
                    {business.name}
                </Link>
            </h3>

            {/* Sub-details */}
            <div className={cn(
                "relative z-10 flex items-center gap-3 text-[10px] font-medium h-5 font-mono text-[#2a1b0a]/70"
            )}>
                {/* Trust Badge */}
                <div className={cn(
                    "flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full border transition-all bg-[#fcf5e5] border-[#2a1b0a]/10"
                )}>
                    <div className="relative flex items-center justify-center w-3.5 h-3.5">
                        <Shield className={cn(
                            isHighTrust ? 'text-emerald-600 fill-emerald-600/10' : 'text-amber-600 fill-amber-600/10',
                            "w-3.5 h-3.5"
                        )} strokeWidth={2.5} />
                    </div>
                    <span className={cn(
                        "tracking-wide font-bold text-[10px]",
                        isHighTrust ? 'text-emerald-600' : 'text-amber-600'
                    )}>
                        TRUST SCORE {trustScore}/5
                    </span>
                </div>

                {/* Separator */}
                <span className="opacity-20">|</span>

                <div className={cn(
                    "flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full border transition-all bg-[#fcf5e5] border-red-200/50"
                )}>
                    <Siren className="w-3.5 h-3.5 animate-emergency-flash text-red-600 transition-all" />
                    <span className="text-[#2a1b0a] font-bold uppercase text-[10px] tracking-wide">Emergency Pro</span>
                </div>
            </div>
        </div>
    );
}
