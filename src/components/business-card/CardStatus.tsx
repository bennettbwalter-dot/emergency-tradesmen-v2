import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Business, isBusinessAvailable } from "@/lib/businesses";

interface CardStatusProps {
    business: Business;
    isParchment?: boolean;
}

export function CardStatus({ business, isParchment }: CardStatusProps) {
    const isLive = isBusinessAvailable(business);

    return (
        <div className="grid grid-cols-2 gap-3 h-10 w-full mt-1">
            {/* Rating - Solid Gold Pill or Ink Stamp */}
            <div className={cn(
                "flex items-center justify-center gap-2 h-full border w-full transition-all",
                "bg-[#fcf5e5]/40 border-[#2a1b0a]/10 text-[#2a1b0a] font-mono rounded"
            )}>
                <Star className="w-3.5 h-3.5 text-gold fill-current shrink-0" />
                <span className="leading-none translate-y-[1px] font-bold text-sm">{business.rating.toFixed(1)}</span>
                <span className="leading-none translate-y-[1px] text-[10px] opacity-70 font-medium">({business.reviewCount}) Reviews</span>
            </div>
 
            {/* Availability - Glowing Emerald/Red or Ink Stamp */}
            <div className={cn(
                "relative flex items-center justify-center gap-2 h-full border overflow-hidden w-full transition-all duration-300",
                "bg-[#fcf5e5]/40 border-[#2a1b0a]/10 text-[#2a1b0a] font-mono rounded"
            )}>
                <span className={cn(
                    "uppercase tracking-widest leading-none translate-y-[1px] text-xs font-bold",
                    isLive ? "text-emerald-700" : "text-red-700"
                )}>
                    {isLive ? 'Available' : 'Offline'}
                </span>
            </div>
        </div>
    );
}
