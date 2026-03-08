import { MapPin, Clock, ShieldCheck, Globe, CheckCircle } from "lucide-react";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { trackEvent } from "@/lib/analytics";
import { Business, calculateTrustScore } from "@/lib/businesses";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardDetailsProps {
    business: Business;
}

export function CardDetails({ business }: CardDetailsProps) {
    const { theme } = useSimpleTheme();
    const trustScore = calculateTrustScore(business);

    // Helper to ensure valid URLs
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('//')) return `https:${url}`;
        if (url.includes('.') && !url.includes(' ')) return `https://${url}`;
        return url;
    };

    const details = [
        {
            icon: MapPin,
            text: `${business.address || "Local Service Area"}${business.distance ? ` (${(business.distance * 0.621371).toFixed(1)} miles)` : ''}`
        },
        {
            icon: Clock,
            text: business.hours || "24/7 Emergency Service"
        },
        {
            icon: ShieldCheck,
            text: `Verified Local Pro (${trustScore}/5 Trust)`
        },
        {
            icon: Globe,
            text: business.website ? "Visit Website" : "No Website",
            href: business.website ? ensureAbsoluteUrl(business.website) : undefined
        },
        ...(business.email ? [{ icon: CheckCircle, text: "Verified Email Contact" }] : [])
    ].slice(0, 4);

    // If we have fewer than 4 items (though unlikely given the defaults), fill up to 4
    while (details.length < 4) {
        details.push({ icon: Globe, text: "No Website" });
    }

    return (
        <div className="flex flex-col gap-2 w-full mt-2 font-ui">
            {details.map((item, i) => {
                // Website Link with special styling
                if (item.href) {
                    return (
                        <HoverBorderGradient
                            key={i}
                            as="a"
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackEvent("Business", "Website Click", business.name)}
                            containerClassName="rounded-full w-full h-10"
                            className="w-full h-full flex items-center justify-start px-4 bg-zinc-900/90 text-white group"
                            glowColor={theme === 'light' ? "#D4AF37" : undefined}
                        >
                            <div className="w-6 flex justify-center shrink-0 mr-3">
                                <item.icon className="w-4 h-4 text-gold group-hover:text-white transition-colors" strokeWidth={1.5} />
                            </div>
                            <span className="text-xs font-medium truncate w-full pt-[1px] tracking-wide text-zinc-100 group-hover:text-white transition-colors">
                                {item.text}
                            </span>
                        </HoverBorderGradient>
                    );
                }

                const isNoWebsite = item.text === "No Website";

                return (
                    <div key={i} className={`relative group flex items-center h-10 w-full px-4 rounded-full border border-white/5 bg-white/5 transition-colors ${isNoWebsite ? 'opacity-40 grayscale pointer-events-none' : 'hover:bg-white/10'}`}>
                        <div className="w-6 flex justify-center shrink-0 mr-3">
                            <item.icon className={`w-4 h-4 text-muted-foreground transition-colors ${!isNoWebsite && 'group-hover:text-gold'}`} strokeWidth={1.5} />
                        </div>
                        <span className="text-xs text-muted-foreground group-hover:text-foreground font-medium truncate w-full pt-[1px] tracking-wide transition-colors">
                            {item.text}
                        </span>

                        {!isNoWebsite && (
                            <div className="absolute inset-0 rounded-full ring-1 ring-gold/0 group-hover:ring-gold/20 transition-all duration-500" />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
