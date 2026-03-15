import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { US_STATES } from '@/lib/us_states';
import { usCityCoordinates } from '@/lib/usCityCoordinates';
import { cityToState } from '@/lib/trades';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, X, ChevronUp, ChevronDown, Check, Globe, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { cityCoordinates } from '@/lib/cityCoordinates';

const UK_MAJOR_CITIES = [
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Liverpool", "Edinburgh", "Bristol", "Cardiff",
    "Belfast", "Newcastle upon Tyne", "Nottingham", "Leicester", "Southampton", "Portsmouth", "Brighton", "Cambridge", "Oxford"
].sort();

export function LocationOverrideTool() {
    const isDev = import.meta.env.DEV;
    const isUSDomain = typeof window !== 'undefined' && (
        window.location.hostname.includes('emergencycontractors.net') || 
        (window.location.hostname === 'localhost' && window.location.port === '3001') ||
        (window.location.hostname === '127.0.0.1' && window.location.port === '3001')
    );
    const isUKDomain = typeof window !== 'undefined' && (
        window.location.hostname.includes('emergencytradesmen.net') || 
        (window.location.hostname === 'localhost' && window.location.port === '3000') ||
        (window.location.hostname === '127.0.0.1' && window.location.port === '3000')
    );
    
    if (!isDev || (!isUSDomain && !isUKDomain)) return null;

    const { setOverride, clearOverride, isOverridden, detectedCity } = useLocalization();
    const [isOpen, setIsOpen] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string>("");

    const handleClear = () => {
        clearOverride();
        setSelectedLocation("");
        toast.info("Using real GPS", { duration: 2000, position: 'bottom-right' });
    };

    const handleApplyOverride = () => {
        if (!selectedLocation) return;
        
        if (isUSDomain) {
            // Find a representative city for this state to get coordinates
            const cityName = Object.keys(usCityCoordinates).find(city => 
                cityToState[city]?.toLowerCase() === selectedLocation.toLowerCase()
            );

            if (cityName) {
                const coords = usCityCoordinates[cityName];
                setOverride({ latitude: coords.lat, longitude: coords.lng }, cityName);
                toast.success(`Simulating: ${selectedLocation.toUpperCase()}`, {
                    duration: 2000,
                    position: 'bottom-right'
                });
            }
        } else if (isUKDomain) {
            const coords = cityCoordinates[selectedLocation];
            if (coords) {
                setOverride({ latitude: coords.lat, longitude: coords.lng }, selectedLocation);
                toast.success(`Simulating: ${selectedLocation}`, {
                    duration: 2000,
                    position: 'bottom-right'
                });
            }
        }
    };


    return (
        <div className="fixed bottom-20 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            {/* Panel */}
            <div className={cn(
                "w-72 bg-background/95 backdrop-blur-xl border border-gold/30 rounded-2xl shadow-2xl transition-all duration-300 transform origin-bottom-right pointer-events-auto",
                expanded ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4 pointer-events-none h-0 invisible"
            )}>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                                <Globe className="w-4 h-4 text-gold" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold leading-none">Location Spoofer</h4>
                                <p className="text-[10px] text-muted-foreground mt-1">Dev Testing Only</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="h-6 w-6 rounded-full hover:bg-gold/10">
                            <X className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pl-1">
                                {isUSDomain ? 'Region' : 'City'}
                            </label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger className="h-9 bg-secondary/30 border-border/50 text-sm">
                                    <SelectValue placeholder={isUSDomain ? "Select State" : "Select City"} />
                                </SelectTrigger>
                                <SelectContent className="z-[10001] max-h-60">
                                    {isUSDomain ? (
                                        US_STATES.map(state => (
                                            <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                                        ))
                                    ) : (
                                        UK_MAJOR_CITIES.map(city => (
                                            <SelectItem key={city} value={city}>{city}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleClear}
                                className="h-9 text-xs border-border/50 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                            >
                                Reset GPS
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={handleApplyOverride}
                                disabled={!selectedLocation}
                                className="h-9 text-xs bg-gold hover:bg-gold-light text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all active:scale-95"
                            >
                                Apply Spoof
                            </Button>
                        </div>
                    </div>
                </div>
                
                {isOverridden && (
                    <div className="bg-gold/5 border-t border-gold/10 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-foreground truncate max-w-[140px]">
                                ACTIVE: {detectedCity}
                            </span>
                        </div>
                        <span className="text-[9px] font-mono text-muted-foreground bg-black/20 px-1.5 py-0.5 rounded">
                            {isUSDomain ? selectedLocation.toUpperCase() : 'UK'}
                        </span>
                    </div>
                )}
            </div>

            {/* Floating Trigger */}
            <div className="pointer-events-auto group relative">
                {isOverridden && (
                    <div className="absolute -top-1 -right-1 z-10 w-4 h-4 bg-red-500 rounded-full border-2 border-background flex items-center justify-center animate-bounce">
                        <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                )}
                <Button
                    onClick={() => setExpanded(!expanded)}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center p-0 overflow-hidden border border-gold/30",
                        expanded 
                            ? "bg-stone-900 border-gold rotate-90" 
                            : "bg-black hover:bg-stone-900 hover:scale-110 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    )}
                >
                    {expanded ? (
                        <ChevronDown className="w-6 h-6 text-gold" />
                    ) : (
                        <div className="flex flex-col items-center">
                            <MapPin className={cn("w-6 h-6", isOverridden ? "text-red-500" : "text-gold")} />
                            <span className="text-[8px] font-bold mt-0.5 text-gold/50 tracking-tighter">SPOOF</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
