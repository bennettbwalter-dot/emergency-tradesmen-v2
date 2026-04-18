import { Phone, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Business } from "@/lib/businesses";

interface FloatingEmergencyCTAProps {
    business?: Business | null;
    trade?: string;
    city?: string;
    countryCode?: string;
}

export function FloatingEmergencyCTA({ business, trade, city, countryCode }: FloatingEmergencyCTAProps) {
    const phoneNumber = business?.phone || "";
    const proName = business?.name || `Emergency ${trade} in ${city}`;

    if (!phoneNumber) return null;

    return (
        <>
            {/* Mobile: floating button above nav */}
            <div className="md:hidden fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+12px)] left-4 right-4 z-[49] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button
                    asChild
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-2 border-emerald-500/50 flex items-center justify-between px-6 backdrop-blur-sm"
                >
                    <a href={`tel:${phoneNumber.replace(/\s/g, '')}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <Phone className="w-5 h-5 fill-white" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-80 leading-none mb-1">Call Local Expert</p>
                                <p className="text-sm font-bold truncate max-w-[150px]">{proName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider">Online</span>
                        </div>
                    </a>
                </Button>
            </div>

            {/* Desktop: sticky top bar */}
            <div className="hidden md:flex fixed top-0 left-0 right-0 z-[49] bg-emerald-700/95 backdrop-blur-sm border-b border-emerald-600/50 shadow-lg animate-in fade-in slide-in-from-top-2 duration-500 items-center justify-center gap-4 px-6 py-2.5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="text-white text-sm font-semibold">{proName} is available now</span>
                </div>
                <a
                    href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                    className="flex items-center gap-2 bg-white text-emerald-800 font-black text-sm px-4 py-1.5 rounded-full hover:bg-emerald-50 transition-colors"
                >
                    <Phone className="w-3.5 h-3.5" />
                    {phoneNumber}
                </a>
                <Zap className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200 text-xs">Fast response guaranteed</span>
            </div>
        </>
    );
}
