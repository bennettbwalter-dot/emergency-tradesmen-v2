import React from "react";
import { Facebook, Instagram, Linkedin, Twitter, Video } from "lucide-react";
import { cn } from "@/lib/utils";

type SocialPlatform = "facebook" | "instagram" | "linkedin" | "twitter" | "tiktok";

interface GlassSocialIconProps {
    platform: SocialPlatform;
    href: string;
    className?: string;
}

const platformConfig = {
    facebook: {
        icon: Facebook,
        color: "#1877F2",
        hoverShadow: "hover:shadow-[0_0_20px_rgba(24,119,242,0.4)]",
        hoverBorder: "hover:border-[#1877F2]/50",
        gradient: "from-[#1877F2]/20 to-transparent"
    },
    instagram: {
        icon: Instagram,
        color: "#E1306C",
        hoverShadow: "hover:shadow-[0_0_20px_rgba(225,48,108,0.4)]",
        hoverBorder: "hover:border-[#E1306C]/50",
        gradient: "from-[#E1306C]/20 to-transparent"
    },
    linkedin: {
        icon: Linkedin,
        color: "#0077B5",
        hoverShadow: "hover:shadow-[0_0_20px_rgba(0,119,181,0.4)]",
        hoverBorder: "hover:border-[#0077B5]/50",
        gradient: "from-[#0077B5]/20 to-transparent"
    },
    twitter: {
        icon: Twitter,
        color: "#ffffff", // X is white in dark mode
        hoverShadow: "hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]",
        hoverBorder: "hover:border-white/50",
        gradient: "from-white/10 to-transparent"
    },
    tiktok: {
        icon: Video, // Lucide doesn't have TikTok, Video is a common substitute or we just stick to this.
        color: "#00f2ea", // TikTok Cyan
        hoverShadow: "hover:shadow-[0_0_20px_rgba(0,242,234,0.4)]", // Cyan glow
        hoverBorder: "hover:border-[#00f2ea]/50",
        gradient: "from-[#00f2ea]/20 to-transparent"
    }
};

export function GlassSocialIcon({ platform, href, className }: GlassSocialIconProps) {
    const config = platformConfig[platform];
    const Icon = config.icon;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300",
                "bg-white/5 dark:bg-black/40 backdrop-blur-md border border-white/10 dark:border-white/10 shadow-[inner_0_0_10px_rgba(255,255,255,0.05)]",
                "hover:scale-110 hover:-translate-y-1",
                config.hoverShadow,
                config.hoverBorder,
                className
            )}
        >
            {/* Inner Gradient Reflection (Passive specific color glow) */}
            <div
                className={cn(
                    "absolute inset-0 rounded-xl opacity-20 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br",
                    config.gradient
                )}
            />

            {/* Icon with brand color */}
            <Icon
                className={cn(
                    "w-5 h-5 relative z-10 transition-all duration-300 group-hover:text-white group-hover:scale-110"
                )}
                style={{
                    color: config.color,
                    filter: "drop-shadow(0 0 8px rgba(255,255,255,0.1))"
                }}
                strokeWidth={1.5}
            />

            {/* Bottom Shine */}
            <div className="absolute inset-x-2 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
        </a>
    );
}
