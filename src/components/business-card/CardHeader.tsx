import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
    isParchment?: boolean;
}

export function CardHeader({ business, rank, isParchment }: CardHeaderProps) {
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
                {/* Premium Rank Badge or WANTED Image */}
                <div className="relative mx-auto flex flex-col items-center -translate-y-1">
                    <img 
                        src="/images/ui/wanted-badge.jpg" 
                        alt="WANTED" 
                        className="h-12 sm:h-14 w-auto object-contain mix-blend-multiply"
                    />
                    <div className="absolute -bottom-2 bg-[#fcf5e5] border border-[#2a1b0a]/30 px-2 py-0.5 rounded shadow-sm">
                        <span className="font-mono font-black text-[#2a1b0a] text-[10px] tracking-tighter">NO. {rank}</span>
                    </div>
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleFavorite}
                    className="absolute right-0 w-10 h-10 flex items-center justify-center text-[#2a1b0a]/30 hover:text-red-600 hover:bg-red-600/10 rounded-full transition-all duration-300"
                    aria-label={liked ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={`w-5 h-5 ${liked ? 'fill-red-600 text-red-600' : ''}`} strokeWidth={1.5} />
                </button>
            </div>

            {/* Trade Tag & Profile Link */}
            <div className="flex justify-between items-center h-6">
                <span className="inline-flex items-center justify-center px-3 h-6 rounded bg-[#fcf5e5]/40 border border-[#2a1b0a]/10 shadow-inner backdrop-blur-sm text-[9px] font-black tracking-[0.15em] text-[#2a1b0a]/70 uppercase font-mono">
                    {tradeName}
                </span>

                <HoverBorderGradient
                    as={Link}
                    to={`/business/${business.id}`}
                    containerClassName="rounded-none h-6"
                    className="h-full flex items-center px-3 bg-zinc-800 text-white gap-1 group/link border-2 border-zinc-900"
                    glowColor="#D4AF37"
                >
                    <span className="text-[9px] font-bold uppercase tracking-wider group-hover/link:text-gold transition-colors font-mono">View Profile</span>
                    <ArrowRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform text-gold" />
                </HoverBorderGradient>
            </div>
        </>
    );
}
