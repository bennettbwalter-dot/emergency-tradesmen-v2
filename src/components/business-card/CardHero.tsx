import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Business, calculateTrustScore } from "@/lib/businesses";

interface CardHeroProps {
    business: Business;
    isParchment?: boolean;
}

export function CardHero({ business, isParchment }: CardHeroProps) {
    const trustScore = calculateTrustScore(business);

    return (
        <div className={cn(
            "group relative rounded-none border-b-2 border-dashed border-[#2a1b0a]/20 px-5 pt-3 pb-2 flex flex-col justify-center gap-1 transition-all duration-300 min-h-[3.5rem] mt-2 bg-transparent shadow-none"
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
        </div>
    );
}
