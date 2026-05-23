
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
    cityPlaceholder?: string;
    staticStateLabel?: string;
    staticCityLabel?: string;
    buttonClassName?: string;
    onStateSelected?: (stateCode: string | null) => void;
    showLabelOnMobile?: boolean;
    showCityPlaceholder?: boolean;
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

export function HierarchicalLocationSelector({ className, onLocationSelect, placeholder, cityPlaceholder = "City / Area", staticStateLabel, staticCityLabel, buttonClassName, onStateSelected, showLabelOnMobile = false, showCityPlaceholder = false }: HierarchicalLocationSelectorProps) {
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
        
        if (onStateSelected) {
            onStateSelected(state?.code || null);
        }

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

                const cleanRecord = {
                    ...record,
                    path_slugs: {
                        state: selectedState.slug,
                        metro: selectedCity.metroSlug,
                        city: selectedCity.slug,
                        suburb: '' // Will need handling in consumer
                    }
                };
                onLocationSelect(cleanRecord); 
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
                <SelectTrigger
                    data-tour="tour-state-button"
                    className={cn(
                        "h-11 w-full flex-1 md:w-full md:flex-1 rounded-full border-none transition-all flex items-center justify-center md:justify-between px-0 md:px-4 focus:ring-0 overflow-visible [&>*:last-child]:hidden md:[&>*:last-child]:flex",
                        (selectedCity || selectedSuburb) ? 'hidden md:flex' : 'flex',
                        selectedState ? 'bg-transparent text-[#9B7D4F] hover:bg-[#9B7D4F]/5' : 'bg-transparent text-[#9B7D4F]/70 hover:bg-[#9B7D4F]/5',
                        buttonClassName
                    )}
                >
                    <MapPin className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-[#9B7D4F]" />
                    <div className={showLabelOnMobile ? "block min-w-0 truncate" : "hidden md:block"}>
                        {staticStateLabel ? <span>{staticStateLabel}</span> : <SelectValue placeholder={placeholder || "State"} />}
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
            {selectedState ? (
                <Popover open={cityOpen} onOpenChange={setCityOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={cityOpen}
                            data-tour="tour-city-button"
                            className={cn(
                                "h-11 px-0 md:px-4 w-full flex-1 md:w-full md:flex-1 rounded-full border-none transition-all flex items-center justify-center md:justify-between overflow-visible",
                                selectedSuburb ? 'hidden md:flex' : 'flex',
                                selectedCity ? 'bg-transparent text-[#9B7D4F] hover:bg-gold/5' : 'bg-transparent text-[#9B7D4F]/70 hover:bg-gold/5',
                                buttonClassName
                            )}
                        >
                            <div className={cn("flex items-center justify-center w-full md:w-auto md:justify-start md:gap-2", showLabelOnMobile && "gap-2")}>
                                <MapPin className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-[#9B7D4F]" />
                                <span className={cn(showLabelOnMobile ? "inline" : "hidden md:inline", "truncate", !selectedCity && "text-muted-foreground")}>
                                    {staticCityLabel || selectedCity?.name || cityPlaceholder}
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
            ) : showCityPlaceholder ? (
                <Button
                    type="button"
                    variant="outline"
                    disabled
                    className={cn("h-11 w-full flex-1 rounded-full border-none bg-transparent px-0 text-[#9B7D4F]/45 opacity-70 md:px-4", buttonClassName)}
                >
                    <div className={cn("flex w-full items-center justify-center md:w-auto md:justify-start md:gap-2", showLabelOnMobile && "gap-2")}>
                        <MapPin className="h-5 w-5 shrink-0 text-[#9B7D4F]/55 md:h-4 md:w-4" />
                        <span className={cn(showLabelOnMobile ? "inline" : "hidden md:inline", "truncate")}>
                            {staticCityLabel || cityPlaceholder}
                        </span>
                    </div>
                </Button>
            ) : null}

            {/* Suburb/Area Select REMOVED for US as requested */}
        </div>
    );
}

