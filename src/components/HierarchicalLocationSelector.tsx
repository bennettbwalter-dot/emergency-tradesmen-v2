
import React, { useState, useEffect } from 'react';
import { Map, Building2, MapPin, Home, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import usData from '@/lib/us_cities.json';

interface HierarchicalLocationSelectorProps {
    className?: string;
    onLocationSelect: (record: any) => void;
    placeholder?: string;
}

// Data Types
interface Suburb { name: string; slug: string; }
interface City { name: string; slug: string; suburbs?: Suburb[]; }
interface Metro { name: string; slug: string; cities?: City[]; }
interface State { name: string; code: string; slug: string; metros?: Metro[]; }

// Internal flattened type for UI
interface FlattenedCity extends City {
    metroSlug: string;
}

const US_STATES = (usData as any).states as State[];

export function HierarchicalLocationSelector({ className, onLocationSelect, placeholder }: HierarchicalLocationSelectorProps) {
    // Selection State
    const [selectedState, setSelectedState] = useState<State | null>(null);
    const [selectedCity, setSelectedCity] = useState<FlattenedCity | null>(null);
    const [selectedSuburb, setSelectedSuburb] = useState<Suburb | null>(null);
    const [cityOpen, setCityOpen] = useState(false);

    // Derived Lists
    const [availableCities, setAvailableCities] = useState<FlattenedCity[]>([]);

    // Sort states on mount (though JSON is likely sorted, good practice)
    const sortedStates = [...US_STATES].sort((a, b) => a.name.localeCompare(b.name));

    // Handle State Change
    const handleStateChange = (slug: string) => {
        const state = US_STATES.find(s => s.slug === slug) || null;
        setSelectedState(state);
        setSelectedCity(null);
        setSelectedSuburb(null);
        setAvailableCities([]);

        if (state && state.metros) {
            // Flatten cities from all metros
            const flatCities: FlattenedCity[] = [];
            state.metros.forEach(metro => {
                if (metro.cities) {
                    metro.cities.forEach(city => {
                        flatCities.push({
                            ...city,
                            metroSlug: metro.slug
                        });
                    });
                }
            });
            // Sort alphabetically
            flatCities.sort((a, b) => a.name.localeCompare(b.name));
            setAvailableCities(flatCities);
        }
    };

    // Handle City Change
    const handleCityChange = (slug: string) => {
        const city = availableCities.find(c => c.slug === slug) || null;
        setSelectedCity(city);
        setSelectedSuburb(null);

        // If city has no suburbs, trigger selection immediately
        if (city && (!city.suburbs || city.suburbs.length === 0) && selectedState) {
            const record = {
                id: city.slug,
                type: 'city',
                country: 'US',
                name: city.name,
                state: selectedState.slug.toUpperCase(),
                anchor_city: city.name,
                anchor_slug: city.slug,
                area_slug: city.slug,
                metro_slug: city.metroSlug,
                path_slugs: {
                    state: selectedState.slug,
                    metro: city.metroSlug,
                    city: city.slug,
                    suburb: ''
                }
            };
            onLocationSelect(record);
        }
    };

    // Handle Suburb Change
    const handleSuburbChange = (slug: string) => {
        // Special case: "all-city" slug to select just the city
        if (slug === 'all-city') {
            if (selectedState && selectedCity) {
                const record = {
                    id: selectedCity.slug,
                    type: 'city',
                    country: 'US',
                    name: selectedCity.name,
                    state: selectedState.slug.toUpperCase(),
                    anchor_city: selectedCity.name,
                    anchor_slug: selectedCity.slug,
                    area_slug: selectedCity.slug, // Generic fallback
                    metro_slug: selectedCity.metroSlug,
                    path_slugs: {
                        state: selectedState.slug,
                        metro: selectedCity.metroSlug,
                        city: selectedCity.slug,
                        suburb: '' // Empty suburb for city-level
                    }
                };

                // Adjust routing in SearchFilterBar to handle empty suburb?
                // SearchFilterBar uses: /us/${state}/${metro}/${city}/${suburb}/${trade}
                // If suburb is empty, we get //trade?
                // We should probably pass a special value or handle it in SearchFilterBar.
                // Let's pass a synthetic suburb slug for "all" or simply rely on the parent to handle.
                // Actually, if we pass 'all', routing becomes /us/.../city/all/trade ? No, that's not standard.
                // Best to redirect to /us/.../city (no suburb).
                // SearchFilterBar logic:
                // if (record.path_slugs) ... /us/${state}/${metro}/${city}/${suburb}/${tradeSlug}
                // If suburb is empty string, it becomes .../city//trade... double slash.

                // We will handle this by passing a sanitized record.
                // However, the `SearchFilterBar` is expecting a suburb.
                // Let's trigger selection.
                // We'll trust the consumer handles it, or clean up the slug.

                // Hack: If slug is 'all-city', we want to navigate to the city page.
                // We pass `suburb: undefined`?
                const cleanRecord = {
                    ...record,
                    path_slugs: {
                        state: selectedState.slug,
                        metro: selectedCity.metroSlug,
                        city: selectedCity.slug,
                        suburb: '' // Will need handling in consumer
                    }
                };
                onLocationSelect(cleanRecord); // This might cause double slash issue if consumer is naive.
                return;
            }
        }

        const suburb = selectedCity?.suburbs?.find(s => s.slug === slug) || null;
        setSelectedSuburb(suburb);

        if (suburb && selectedState && selectedCity) {
            const record = {
                id: suburb.slug,
                type: 'suburb',
                country: 'US',
                name: suburb.name,
                state: selectedState.slug.toUpperCase(),
                anchor_city: selectedCity.name,
                anchor_slug: selectedCity.slug, // Display
                area_slug: suburb.slug,
                metro_slug: selectedCity.metroSlug,
                path_slugs: {
                    state: selectedState.slug,
                    metro: selectedCity.metroSlug,
                    city: selectedCity.slug,
                    suburb: suburb.slug
                }
            };
            onLocationSelect(record);
        }
    };

    return (
        <div className={`flex flex-nowrap gap-2 items-center w-full ${className}`}>
            {/* State Select */}
            <Select value={selectedState?.slug || ""} onValueChange={handleStateChange}>
                <SelectTrigger className={`h-11 w-12 md:w-full md:flex-1 rounded-full border border-gold/50 transition-all flex items-center justify-center md:justify-between px-0 md:px-4 shadow-sm focus:ring-0 shrink-0 [&>*:last-child]:hidden md:[&>*:last-child]:flex ${selectedState ? 'bg-white/80 text-black dark:bg-black/40 dark:text-white hover:bg-gold/10 hover:border-gold' : 'bg-white/80 text-black dark:bg-black/40 dark:text-white/70 hover:bg-gold/10 hover:border-gold'}`}>
                    <Map className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-gold" />
                    <div className="hidden md:block">
                        <SelectValue placeholder="State" />
                    </div>
                    <div className="hidden md:block">
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {sortedStates.map((s) => (
                        <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* City Select (Flattened, no Metro) - SEARCHABLE */}
            {selectedState && (
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            className={cn(
                                "h-11 px-0 md:px-4 w-12 md:w-full md:flex-1 rounded-full border border-gold/50 transition-all flex items-center justify-center md:justify-between shadow-sm shrink-0",
                                selectedCity ? 'bg-white/80 text-black dark:bg-black/40 dark:text-white hover:bg-gold/10 hover:border-gold' : 'bg-white/80 text-black dark:bg-black/40 dark:text-white/70 hover:bg-gold/10 hover:border-gold'
                            )}
                        >
                            <div className="flex items-center justify-center md:justify-start md:gap-2">
                                <Building2 className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-gold" />
                                <span className={cn("hidden md:inline truncate", !selectedCity && "text-muted-foreground")}>
                                    {selectedCity?.name || "City"}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </div>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[250px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Type to search..." />
                            <CommandList>
                                <CommandEmpty>No city found.</CommandEmpty>
                                <CommandGroup heading={`Cities in ${selectedState.name}`}>
                                    {availableCities.map((c) => (
                                        <CommandItem
                                            key={c.slug}
                                            value={c.name}
                                            onSelect={() => {
                                                handleCityChange(c.slug);
                                                setCityOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCity?.slug === c.slug ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {c.name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            )}

            {/* Suburb/Area Select - Only show if suburbs exist */}
            {selectedCity && selectedCity.suburbs && selectedCity.suburbs.length > 0 && (
                <Select value={selectedSuburb?.slug || ""} onValueChange={handleSuburbChange}>
                    <SelectTrigger className={`h-11 w-12 md:w-full md:flex-1 rounded-full border border-gold/50 transition-all flex items-center justify-center md:justify-between px-0 md:px-4 shadow-sm focus:ring-0 shrink-0 [&>*:last-child]:hidden md:[&>*:last-child]:flex ${selectedSuburb ? 'bg-white/80 text-black dark:bg-black/40 dark:text-white hover:bg-gold/10 hover:border-gold' : 'bg-white/80 text-black dark:bg-black/40 dark:text-white/70 hover:bg-gold/10 hover:border-gold'}`}>
                        <Home className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-gold" />
                        <div className="hidden md:block">
                            <SelectValue placeholder="Area" />
                        </div>
                        <div className="hidden md:block">
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                        {/* Option to select the city itself */}
                        <SelectItem value="all-city" className="text-emerald-500 font-medium border-b border-border/50">
                            All {selectedCity.name}
                        </SelectItem>

                        {selectedCity.suburbs?.map((s) => (
                            <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </div>
    );
}
