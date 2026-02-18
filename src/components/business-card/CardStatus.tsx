import { Star } from "lucide-react";
import { Business, isBusinessAvailable } from "@/lib/businesses";

interface CardStatusProps {
    business: Business;
}

export function CardStatus({ business }: CardStatusProps) {
    const isLive = isBusinessAvailable(business);

    return (
        <div className="grid grid-cols-2 gap-3 h-10 w-full mt-1">
            {/* Rating - Solid Gold Pill */}
            <div className="flex items-center justify-center gap-2 h-full rounded-full border border-gold/30 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-black w-full shadow-sm text-gold-dark dark:text-gold-light font-ui">
                <Star className="w-3.5 h-3.5 fill-current text-gold shrink-0" />
                <span className="font-bold text-sm leading-none translate-y-[1px]">{business.rating.toFixed(1)}</span>
                <span className="text-[10px] opacity-80 leading-none translate-y-[1px] font-medium">({business.reviewCount})</span>
            </div>

            {/* Availability - Glowing Emerald/Red */}
            <div className={`relative flex items-center justify-center gap-2 h-full rounded-full border overflow-hidden w-full transition-all duration-300 font-ui
            ${isLive
                    ? 'border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                    : 'border-red-500/20 bg-red-950/10'
                }`}>
                <div className={`w-2 h-2 shrink-0 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-red-500/70'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest leading-none translate-y-[1px] ${isLive ? 'text-emerald-500' : 'text-red-400/80'}`}>
                    {isLive ? 'Available' : 'Offline'}
                </span>
                {isLive && <div className="absolute inset-0 bg-emerald-500/5 blur-md pointer-events-none" />}
            </div>
        </div>
    );
}
