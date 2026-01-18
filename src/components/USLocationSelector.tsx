import { useState, useEffect } from 'react';
import { MapPin, Building, Home, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { loadUSLocationData, getCitiesInState, searchCitiesInState, State } from '@/lib/locationService';

interface USLocationSelectorProps {
    onLocationSelect?: (location: string) => void;
    className?: string;
}

interface FlattenedCity {
    name: string;
    slug: string;
    metroSlug: string;
    suburbs?: { name: string; slug: string }[];
}

export function USLocationSelector({ onLocationSelect, className }: USLocationSelectorProps) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    // Data Loading State
    const [states, setStates] = useState<State[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Selection State
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [selectedCity, setSelectedCity] = useState<FlattenedCity | null>(null);

    // Filter/Pagination State
    const [availableCities, setAvailableCities] = useState<FlattenedCity[]>([]);
    const [citySearchTerm, setCitySearchTerm] = useState('');
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // Load States on mount (lazy)
    useEffect(() => {
        if (open && states.length === 0) {
            setIsLoadingData(true);
            loadUSLocationData()
                .then(data => {
                    setStates(data.states);
                })
                .catch(err => console.error("Failed to load location data", err))
                .finally(() => setIsLoadingData(false));
        }
    }, [open]);

    // Update Cities when State selected or Search changes
    useEffect(() => {
        if (!selectedState) {
            setAvailableCities([]);
            return;
        }

        const fetchCities = async () => {
            setIsLoadingCities(true);
            try {
                if (citySearchTerm.trim()) {
                    // Search mode
                    const results = await searchCitiesInState(selectedState.code, citySearchTerm);
                    setAvailableCities(results);
                } else {
                    // Default mode: Load first 50
                    // TODO: Infinite scroll could go here, but for now 50 keeps it fast
                    const results = await getCitiesInState(selectedState.code, 100);
                    setAvailableCities(results);
                }
            } catch (error) {
                console.error("Error fetching cities", error);
            } finally {
                setIsLoadingCities(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchCities, 300);
        return () => clearTimeout(timeoutId);

    }, [selectedState, citySearchTerm]);


    const handleStateSelect = (state: State) => {
        setSelectedState(state);
        setSelectedCity(null);
        setCitySearchTerm(''); // Reset search
    };

    const handleCitySelect = (city: FlattenedCity) => {
        setSelectedCity(city);

        // Auto-navigate if no suburbs or "Area" context isn't critical
        // But users might expect to see suburbs if available.
        if (!city.suburbs || city.suburbs.length === 0) {
            navigateToCity(city);
        }
    };

    const handleSuburbSelect = (suburb: { name: string; slug: string }) => {
        if (!selectedState || !selectedCity) return;
        // URL: /us/:state/:metro/:city/:suburb
        const path = `/us/${selectedState.slug}/${selectedCity.metroSlug}/${selectedCity.slug}/${suburb.slug}`;
        closeAndNavigate(path);
    };

    const navigateToCity = (city: FlattenedCity) => {
        if (!selectedState) return;
        // URL: /us/:state/:metro/:city
        const path = `/us/${selectedState.slug}/${city.metroSlug}/${city.slug}`;
        closeAndNavigate(path);
    };

    const closeAndNavigate = (path: string) => {
        setOpen(false);
        navigate(path);
        onLocationSelect?.(path);
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    className={cn("rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white gap-2", className)}
                >
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    {selectedCity ? selectedCity.name : selectedState ? selectedState.name : 'Select Location'}
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[350px] sm:w-[800px] border-r-gold/20 bg-slate-950 text-white p-0">
                <SheetHeader className="p-6 border-b border-white/10">
                    <SheetTitle className="text-xl font-display text-white">Select Location</SheetTitle>
                </SheetHeader>

                <div className="flex h-full">

                    {/* COLUMN 1: STATES */}
                    <div className="flex-1 border-r border-white/10 min-w-[200px] flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">1. State</h3>
                        </div>
                        <ScrollArea className="flex-1">
                            {isLoadingData ? (
                                <div className="p-8 flex justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                                </div>
                            ) : (
                                <div className="p-4 space-y-1">
                                    {states.map(state => (
                                        <Button
                                            key={state.code}
                                            variant="ghost"
                                            className={cn(
                                                "w-full justify-start text-white hover:text-gold hover:bg-white/5",
                                                selectedState?.code === state.code && "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                                            )}
                                            onClick={() => handleStateSelect(state)}
                                        >
                                            <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                            {state.name}
                                            {selectedState?.code === state.code && <ChevronRight className="ml-auto h-4 w-4" />}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* COLUMN 2: CITIES */}
                    {selectedState && (
                        <div className="flex-1 border-r border-white/10 min-w-[200px] flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
                            <div className="p-4 border-b border-white/10 space-y-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">2. City</h3>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search city..."
                                        value={citySearchTerm}
                                        onChange={(e) => setCitySearchTerm(e.target.value)}
                                        className="pl-8 bg-white/5 border-white/10 text-white focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-1">
                                    {isLoadingCities ? (
                                        <div className="p-8 flex justify-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                        </div>
                                    ) : availableCities.length > 0 ? (
                                        <>
                                            {availableCities.map(city => (
                                                <Button
                                                    key={`${city.metroSlug}-${city.slug}`}
                                                    variant="ghost"
                                                    className={cn(
                                                        "w-full justify-start text-white hover:text-gold hover:bg-white/5",
                                                        selectedCity?.slug === city.slug && "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                                                    )}
                                                    onClick={() => handleCitySelect(city)}
                                                >
                                                    <Building className="mr-2 h-4 w-4 opacity-50" />
                                                    {city.name}
                                                    {selectedCity?.slug === city.slug && <ChevronRight className="ml-auto h-4 w-4" />}
                                                </Button>
                                            ))}
                                            {!citySearchTerm && (
                                                <p className="text-xs text-slate-500 text-center pt-4 italic">
                                                    Showing top 100 cities. Type to search more.
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="p-4 text-sm text-slate-500 italic text-center">
                                            No cities found.
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}

                    {/* COLUMN 3: AREAS / SUBURBS */}
                    {selectedCity && (
                        <div className="flex-1 min-w-[200px] flex flex-col animate-in fade-in slide-in-from-left-4 duration-200">
                            <div className="p-4 border-b border-white/10">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">3. Area</h3>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-4 space-y-1">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-medium mb-4"
                                        onClick={() => navigateToCity(selectedCity)}
                                    >
                                        <Building className="mr-2 h-4 w-4" />
                                        All {selectedCity.name}
                                    </Button>

                                    {selectedCity.suburbs?.map(sub => (
                                        <Button
                                            key={sub.slug}
                                            variant="ghost"
                                            className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5"
                                            onClick={() => handleSuburbSelect(sub)}
                                        >
                                            <Home className="mr-2 h-4 w-4 opacity-50" />
                                            {sub.name}
                                        </Button>
                                    ))}
                                    {(!selectedCity.suburbs || selectedCity.suburbs.length === 0) && (
                                        <div className="p-4 text-sm text-slate-500 italic">No specific areas listed.</div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

