import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { Business } from "@/lib/businesses";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { useSimpleTheme } from "@/components/simple-theme";
import * as authLib from "@/lib/auth";

interface CardHeaderProps {
    business: Business;
    rank: number;
}

export function CardHeader({ business, rank }: CardHeaderProps) {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const { theme } = useSimpleTheme();

    // Initialize state based on auth check
    const [liked, setLiked] = useState(() => isAuthenticated && business.id ? authLib.isFavorite(business.id) : false);

    const tradeName = business.trade ? business.trade.toUpperCase() : "TRADESPERSON";

    const handleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast({ title: "Sign in to save", description: "Create an account to save your favourite tradespeople.", variant: "default" });
            return;
        }
        if (liked) {
            authLib.removeFavorite(business.id);
            setLiked(false);
            toast({ title: "Removed from saved", description: `${business.name} removed from your saved list.` });
        } else {
            authLib.addFavorite({ businessId: business.id, businessName: business.name, tradeName: business.trade || 'Tradesperson', city: business.city || '' });
            setLiked(true);
            toast({ title: "❤️ Saved!", description: `${business.name} pinned to the top of your list.` });
        }
    };

    return (
        <>
            {/* Rank Badge & Favorite */}
            <div className="flex items-center justify-between h-9 mb-1">
                {/* Premium Rank Badge */}
                <div className="relative h-8 sm:h-9 -ml-3 sm:-ml-4 pl-4 sm:pl-6 pr-4 sm:pr-6 rounded-r-lg shadow-elevation-2 flex items-center gap-2 border-y border-gold/30 shrink-0 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-gold via-gold-light to-gold-dark" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

                    <span className="relative z-10 font-display font-bold text-[#1a1200] text-lg leading-none drop-shadow-sm">#{rank}</span>
                    <div className="relative z-10 w-[1px] h-3 sm:h-4 bg-[#1a1200]/20" />
                    <span className="relative z-10 text-[10px] font-bold text-[#1a1200] uppercase tracking-wider leading-none truncate font-ui">Top Rated</span>

                    {/* Shine effect */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12" />
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleFavorite}
                    className="w-10 h-10 flex items-center justify-center text-zinc-400 dark:text-white/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all duration-300"
                    aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={1.5} />
                </button>
            </div>

            {/* Trade Tag & Profile Link */}
            <div className="flex justify-between items-center h-6">
                <span className="inline-flex items-center justify-center px-3 h-6 rounded bg-secondary/50 border border-white/10 shadow-inner backdrop-blur-sm text-[9px] font-black tracking-[0.15em] text-muted-foreground uppercase font-ui">
                    {tradeName}
                </span>

                <HoverBorderGradient
                    as={Link}
                    to={`/business/${business.id}`}
                    containerClassName="rounded-full h-6"
                    className="h-full flex items-center px-3 bg-zinc-900 text-white gap-1 group/link"
                    glowColor={theme === 'light' ? "#D4AF37" : undefined}
                >
                    <span className="text-[9px] font-bold uppercase tracking-wider group-hover/link:text-gold transition-colors font-ui">View Profile</span>
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform text-gold" />
                </HoverBorderGradient>
            </div>
        </>
    );
}
