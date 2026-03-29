import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { trackEvent } from "@/lib/analytics";
import { Business } from "@/lib/businesses";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardActionsProps {
    business: Business;
    isParchment?: boolean;
}

export function CardActions({ business, isParchment }: CardActionsProps) {
    const { theme } = useSimpleTheme();

    return (
        <div className="grid grid-cols-2 gap-3 mt-1.5 w-full h-11 font-ui">
            {/* Call Button - Primary Action */}
            <HoverBorderGradient
                as="a"
                href={business.phone ? `tel:${business.phone}` : '#'}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                    if (!business.phone) e.preventDefault();
                    trackEvent("Business", "Call Now", business.name);
                }}
                containerClassName={cn("w-full h-full", isParchment ? "rounded-none" : "rounded-lg")}
                className={cn(
                    "w-full h-full flex items-center justify-center px-2 group",
                    isParchment ? "bg-zinc-800 text-white border-2 border-zinc-900" : "bg-zinc-900 text-white"
                )}
                glowColor={theme === 'light' ? "#D4AF37" : undefined}
            >
                <div className={cn(
                    "relative flex items-center justify-center w-5 h-5 mr-1.5 rounded-full transition-colors",
                    isParchment ? "bg-white/20" : "bg-white/10 group-hover:bg-white/20"
                )}>
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                </div>
                <span className={cn(
                    "font-bold text-[10px] sm:text-xs uppercase tracking-widest translate-y-[1px]",
                    isParchment && "font-mono"
                )}>Call</span>
            </HoverBorderGradient>
 
            {/* WhatsApp Button - Secondary Action */}
            <HoverBorderGradient
                as="a"
                href={`https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
                containerClassName={cn("w-full h-full", isParchment ? "rounded-none" : "rounded-lg")}
                className={cn(
                    "w-full h-full flex items-center justify-center px-2 group",
                    isParchment ? "bg-emerald-800 text-white border-2 border-emerald-900" : "bg-emerald-600 dark:bg-emerald-700/80 text-white"
                )}
                glowColor={theme === 'light' ? "#D4AF37" : undefined}
            >
                <div className={cn(
                    "w-5 h-5 mr-1.5 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 bg-white/10 group-hover:bg-white/20 transition-colors",
                    isParchment && "rounded-none"
                )}>W</div>
                <span className={cn(
                    "font-bold text-white text-[10px] sm:text-xs uppercase tracking-widest translate-y-[1px]",
                    isParchment && "font-mono"
                )}>WhatsApp</span>
            </HoverBorderGradient>
        </div>
    );
}
