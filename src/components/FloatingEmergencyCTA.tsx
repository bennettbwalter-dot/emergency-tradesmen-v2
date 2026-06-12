import { Phone, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Business } from "@/lib/businesses";
import { trackEvent } from "@/lib/analytics";

interface FloatingEmergencyCTAProps {
    business?: Business | null;
    trade?: string;
    city?: string;
    countryCode?: string;
}

export function FloatingEmergencyCTA({ business, trade, city, countryCode }: FloatingEmergencyCTAProps) {
    const phoneNumber = business?.phone || "";
    const proName = business?.name || `Emergency ${trade || 'Contractor'} in ${city || 'Local Area'}`;
    const tradeLabel = business?.trade || trade || "contractor";
    const cityLabel = business?.city || city || "my area";

    if (!phoneNumber) return null;

    const domainName = typeof window !== "undefined" ? window.location.hostname : "emergencytradesmen.net";
    const waText = `Hi, I found your profile on ${domainName} and need an emergency ${tradeLabel.toLowerCase()} in ${cityLabel}. Are you available?`;
    const waHref = `https://wa.me/${(business?.whatsapp_number || business?.phone || phoneNumber).replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`;

    return (
        <>
            {/* === MOBILE: Premium Glassmorphic Emergency Widget === */}
            <div className="md:hidden fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 z-[49] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-full bg-zinc-950/85 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.15)] p-3 flex flex-col gap-2.5">
                    {/* Top Reassurance Trust Badges Grid */}
                    <div className="flex items-center justify-between text-[10px] font-semibold border-b border-white/5 pb-2 px-1">
                        <div className="flex items-center gap-1 text-gold">
                            <Phone className="w-3.5 h-3.5" />
                            <span>Direct line — no middlemen</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-400">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>✓ No booking fees</span>
                        </div>
                    </div>

                    {/* Dual Action Conversion Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Call Button (Glowing Pulsing Gold) */}
                        <Button
                            asChild
                            className="h-12 bg-gold hover:bg-gold-light text-black font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-gold/20 flex items-center justify-center gap-2 border border-gold/40 relative overflow-hidden"
                            onClick={() => trackEvent("Business", "Call Now Floating Mobile", proName)}
                        >
                            <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                                <span className="absolute inset-0 bg-white/20 animate-pulse rounded-xl" />
                                <Phone className="w-4 h-4 fill-black" />
                                Call Now
                            </a>
                        </Button>

                        {/* WhatsApp Button (Emerald) */}
                        <Button
                            asChild
                            className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 border border-emerald-500/30"
                            onClick={() => trackEvent("Business", "WhatsApp Floating Mobile", proName)}
                        >
                            <a href={waHref} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="w-4 h-4 fill-white" />
                                WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </div>

            {/* === DESKTOP: Premium Obsidian Sticky Top Bar === */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 z-[49] bg-zinc-950/90 backdrop-blur-md border-b border-gold/20 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-500 items-center justify-between px-8 py-3.5">
                {/* Left side: Live Vetting Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>DIRECT LINE</span>
                    </div>
                    <span className="text-white/90 text-sm font-semibold tracking-wide">
                        Call a local {tradeLabel} in <span className="text-gold capitalize">{cityLabel}</span> direct
                    </span>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-4">
                    {/* Trust indicators */}
                    <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground mr-2 border-r border-white/10 pr-6">
                        <span className="flex items-center gap-1">No middlemen</span>
                        <span className="flex items-center gap-1 text-emerald-400">✓ No booking fees</span>
                    </div>

                    {/* Dual Action buttons */}
                    <a
                        href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                        className="flex items-center gap-2 bg-gold hover:bg-gold-light text-black font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-gold/20 transition-all border border-gold/30 hover:scale-[1.02]"
                        onClick={() => trackEvent("Business", "Call Now Floating Desktop", proName)}
                    >
                        <Phone className="w-3.5 h-3.5 fill-black" />
                        Call {phoneNumber}
                    </a>

                    <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500/20 hover:scale-[1.02]"
                        onClick={() => trackEvent("Business", "WhatsApp Floating Desktop", proName)}
                    >
                        <MessageSquare className="w-3.5 h-3.5 fill-white" />
                        WhatsApp Pro
                    </a>
                </div>
            </div>
        </>
    );
}
