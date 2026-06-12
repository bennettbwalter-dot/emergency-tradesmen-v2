import React, { useState } from 'react';
import { Navigation, Clock, ShieldCheck, MapPin, Compass } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/contexts/LocalizationContext";
import { findNearestCity } from "@/lib/cityCoordinates";

interface RoadsideScrollProps {
    compact?: boolean;
}

export function RoadsideScroll({ compact = false }: RoadsideScrollProps) {
    const { settings } = useLocalization();
    const navigate = useNavigate();
    const [isLocating, setIsLocating] = useState(false);

    const handleGetHelp = () => {
        if (!navigator.geolocation) {
            navigate("/emergency-breakdown");
            return;
        }

        setIsLocating(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                
                let resolvedCity = "";
                
                // 1. Try reverse geocoding via OpenStreetMap Nominatim
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { "Accept-Language": "en" } }
                    );
                    if (response.ok) {
                        const data = await response.json();
                        resolvedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "";
                    }
                } catch (err) {
                    console.warn("Reverse geocode failed", err);
                }

                // 2. Fallback to nearest city by coordinates in our local database
                if (!resolvedCity) {
                    try {
                        const nearest = findNearestCity(latitude, longitude, settings.countryCode);
                        resolvedCity = nearest?.city || "";
                    } catch (err) {
                        console.warn("Nearest city fallback failed", err);
                    }
                }

                setIsLocating(false);

                // Slugify the city name (e.g. "New York" -> "new-york")
                const citySlug = resolvedCity
                    ? resolvedCity.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
                    : "";

                if (citySlug) {
                    navigate(`/emergency-breakdown/${citySlug}`);
                } else {
                    navigate(`/emergency-breakdown`);
                }
            },
            (error) => {
                setIsLocating(false);
                navigate(`/emergency-breakdown`);
            },
            { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
        );
    };

    const features = [
        {
            title: "Roadside Assistance",
            description: "Emergency Breakdown Recovery Available 24/7",
            Icon: Navigation
        },
        {
            title: "Always Online",
            description: "24/7 support because vehicle trouble doesn't stick to business hours.",
            Icon: Clock
        },
        {
            title: "Local Contacts",
            description: "Find public breakdown recovery listings and confirm details directly before booking.",
            Icon: ShieldCheck
        },
        {
            title: "Rapid Response",
            description: "Just a tap away, whether you're stuck at home or on the roadside.",
            Icon: MapPin
        }
    ];

    return (
        <div className="landing-line-card landing-roadside-card">
            <div className="landing-line-card__panel landing-roadside-card__copy">
                <div className="landing-panel-sheen" aria-hidden />
                <div className="relative z-10 flex flex-col items-start text-left">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#caa55b]/10 border border-[#caa55b]/20 text-[#caa55b] text-xs font-bold uppercase tracking-widest mb-4">
                        <Compass className="w-3.5 h-3.5 animate-[spin_10s_linear_infinite]" />
                        24/7 EMERGENCY HELP
                    </span>
                    
                    <h3 className="font-display text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
                        GET ROADSIDE HELP
                    </h3>
                    <p className="text-white/80 text-lg mb-6 leading-relaxed">
                        Stranded on the highway or in your driveway? We connect you instantly to nearby recovery services.
                    </p>
                    
                    <Button 
                        size="xl" 
                        onClick={handleGetHelp}
                        disabled={isLocating}
                        className="bg-gradient-to-r from-[#caa55b] via-[#e2cd97] to-[#caa55b] text-black font-extrabold text-lg px-8 py-6 rounded-full shadow-[0_10px_30px_rgba(202,165,91,0.25)] hover:shadow-[0_15px_40px_rgba(202,165,91,0.45)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 border-none w-full sm:w-auto justify-center"
                    >
                        {isLocating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-3 border-black/20 border-t-black rounded-full animate-spin" />
                                <span>LOCATING YOU...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Navigation className="w-5 h-5" />
                                <span>GET ROADSIDE HELP</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>

            <div className="landing-line-card__panel landing-roadside-card__visual">
                <div className="landing-panel-sheen landing-panel-sheen--cool" aria-hidden />
                <div className="relative z-10 flex flex-col gap-5">
                    <div className="bg-[#18191e]/80 border border-white/5 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-md flex items-center justify-between">
                        {/* Radar sweep illustration */}
                        <div className="relative w-28 h-28 rounded-full border border-white/10 flex items-center justify-center bg-black/40 overflow-hidden flex-shrink-0">
                            {/* Sweeping line */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#caa55b]/20 to-transparent w-full h-full rotate-45 animate-[spin_6s_linear_infinite] origin-center" />
                            {/* Concentric rings */}
                            <div className="w-20 h-20 rounded-full border border-white/5 absolute" />
                            <div className="w-12 h-12 rounded-full border border-white/5 absolute" />
                            {/* Blips */}
                            <div className="w-2 h-2 rounded-full bg-[#caa55b] absolute top-6 right-6 animate-pulse" />
                            <div className="w-2.5 h-2.5 rounded-full bg-[#caa55b] absolute bottom-8 left-6 animate-ping" />
                            <div className="w-1.5 h-1.5 rounded-full bg-[#50b2d7] absolute top-12 left-12 animate-pulse" />
                            {/* Central Pin */}
                            <MapPin className="w-6 h-6 text-[#caa55b] z-10 fill-[#caa55b]/20 drop-shadow-[0_0_8px_rgba(202,165,91,0.6)] animate-bounce" />
                        </div>
                        
                        <div className="flex-1 pl-5 text-left">
                            <h4 className="font-bold text-white text-base mb-1">Active Responders</h4>
                            <div className="space-y-1.5 mt-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Nearest Tow Truck</span>
                                    <span className="text-[#caa55b] font-bold">1.2 miles away</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Estimated ETA</span>
                                    <span className="text-emerald-400 font-bold">12–15 mins</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/60">Status</span>
                                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">READY TO DEPLOY</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {features.map((feature, i) => (
                            <div key={i} className="flex gap-3 items-start bg-white/[0.02] border border-white/5 rounded-xl p-3.5 hover:bg-white/[0.04] transition-colors text-left">
                                <div className="p-2 rounded-lg bg-[#caa55b]/10 border border-[#caa55b]/10 text-[#caa55b] flex-shrink-0">
                                    <feature.Icon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h5 className="font-bold text-white text-sm mb-0.5">{feature.title}</h5>
                                    <p className="text-white/60 text-xs leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
