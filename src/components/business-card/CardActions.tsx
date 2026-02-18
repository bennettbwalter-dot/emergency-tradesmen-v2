import { Phone } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { trackEvent } from "@/lib/analytics";
import { Business } from "@/lib/businesses";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardActionsProps {
    business: Business;
}

export function CardActions({ business }: CardActionsProps) {
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
                containerClassName="rounded-lg w-full h-full"
                className="w-full h-full flex items-center justify-center bg-zinc-900 text-white px-2 group"
                glowColor={theme === 'light' ? "#D4AF37" : undefined}
            >
                <div className="relative flex items-center justify-center w-5 h-5 mr-1.5 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-[10px] sm:text-xs uppercase tracking-widest translate-y-[1px]">Call</span>
            </HoverBorderGradient>

            {/* WhatsApp Button - Secondary Action */}
            <HoverBorderGradient
                as="a"
                href={`https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
                containerClassName="rounded-lg w-full h-full"
                className="w-full h-full flex items-center justify-center bg-emerald-600 dark:bg-emerald-700/80 text-white px-2 group"
                glowColor={theme === 'light' ? "#D4AF37" : undefined}
            >
                <div className="w-5 h-5 mr-1.5 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 bg-white/10 group-hover:bg-white/20 transition-colors">W</div>
                <span className="font-bold text-white text-[10px] sm:text-xs uppercase tracking-widest translate-y-[1px]">WhatsApp</span>
            </HoverBorderGradient>
        </div>
    );
}
