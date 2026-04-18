import { MapPin, Clock, ShieldCheck, Globe, CheckCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { trackEvent } from "@/lib/analytics";
import { Business } from "@/lib/businesses";
import { useSimpleTheme } from "@/components/simple-theme";

interface CardDetailsProps {
    business: Business;
    isParchment?: boolean;
}

export function CardDetails({ business, isParchment }: CardDetailsProps) {
    const { theme } = useSimpleTheme();
    // Helper to ensure valid URLs
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        if (url.startsWith('//')) return `https:${url}`;
        if (url.includes('.') && !url.includes(' ')) return `https://${url}`;
        return url;
    };

    const details: { icon: any; text: string; href?: string }[] = [
        {
            icon: MapPin,
            text: `${business.address || "Local Service Area"}${business.distance ? ` (${(business.distance * 0.621371).toFixed(1)} miles)` : ''}`
        },
        ...(business.phone ? [{
            icon: Phone,
            text: business.phone,
            href: `tel:${business.phone}`
        }] : []),
        {
            icon: Clock,
            text: business.hours || "24/7 Emergency Service"
        },
        {
            icon: Globe,
            text: business.website ? "Visit Website" : "No Website",
            href: business.website ? ensureAbsoluteUrl(business.website) : undefined
        },
    ].slice(0, 5);

    // If we have fewer than 4 items (though unlikely given the defaults), fill up to 4
    while (details.length < 4) {
        details.push({ icon: Globe, text: "No Website" });
    }

    return (
        <div className="flex flex-col w-full mt-2 gap-1 font-mono">
            {details.map((item, i) => {
                // Website Link with special styling
                if (item.href) {
                    return (
                        <HoverBorderGradient
                            key={i}
                            as="a"
                            href={item.href}
                            target={item.icon === Phone ? undefined : "_blank"}
                            rel={item.icon === Phone ? undefined : "noopener noreferrer"}
                            onClick={() => trackEvent("Business", item.icon === Phone ? "Phone Click" : "Website Click", business.name)}
                            containerClassName="w-full rounded-none h-10 py-1"
                            className="w-full h-full flex items-center justify-start px-4 group bg-transparent border-b border-dashed border-[#2a1b0a]/20 text-[#2a1b0a]"
                            glowColor="#D4AF37"
                        >
                            <div className="flex justify-center shrink-0 w-6 mr-3">
                                <item.icon className={cn(
                                    "transition-colors w-4 h-4", 
                                    item.icon === MapPin && "text-red-600",
                                    item.icon === Phone && "text-emerald-700",
                                    item.icon === Clock && "text-amber-600",
                                    item.icon === ShieldCheck && "text-emerald-600",
                                    item.icon === Globe && "text-blue-600",
                                    item.icon === CheckCircle && "text-emerald-600"
                                )} strokeWidth={1.5} />
                            </div>
                            <span className="uppercase leading-[1.2] transition-colors text-[#2a1b0a] font-bold text-xs line-clamp-2">
                                {item.text}
                            </span>
                        </HoverBorderGradient>
                    );
                }

                return (
                    <div key={i} className="relative group flex items-center w-full px-4 transition-colors bg-[#fcf5e5]/40 border-b border-dashed border-[#2a1b0a]/10 rounded-none h-10 py-1">
                        <div className="flex justify-center shrink-0 w-6 mr-3">
                            <item.icon className={cn(
                                "transition-colors w-4 h-4",
                                item.icon === MapPin && "text-red-600",
                                item.icon === Phone && "text-emerald-700",
                                item.icon === Clock && "text-amber-600",
                                item.icon === ShieldCheck && "text-emerald-600",
                                item.icon === Globe && "text-blue-600",
                                item.icon === CheckCircle && "text-emerald-600"
                            )} strokeWidth={1.5} />
                        </div>
                        <span className="text-[#2a1b0a] font-bold uppercase text-xs line-clamp-2 leading-tight transition-colors">
                            {item.text}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
