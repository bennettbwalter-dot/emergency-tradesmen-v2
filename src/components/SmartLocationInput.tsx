import * as React from "react";
import { devLog } from "@/lib/devLog";
import { Check, MapPin, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { searchLocations, SearchResult, LocationRecord } from "@/lib/locationIndex";

interface SmartLocationInputProps {
    onLocationSelect: (location: LocationRecord | null) => void;
    className?: string;
    placeholder?: string;
    defaultValue?: string;
}

export function SmartLocationInput({
    onLocationSelect,
    className,
    placeholder = "Enter city, suburb or ZIP",
    defaultValue = "",
}: SmartLocationInputProps) {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue);
    const [results, setResults] = React.useState<SearchResult[]>([]);
    const [query, setQuery] = React.useState("");

    // Detect Country context
    // This could also come from props if passed explicitly
    const isUS = window.location.pathname.startsWith('/us') || window.location.pathname.includes('/us/');
    const countryFilter = isUS ? 'US' : 'GB';

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                const searchResults = searchLocations(query, countryFilter);
                setResults(searchResults);
                // Auto-open if we have results and not already open
                if (searchResults.length > 0 && !open) {
                    setOpen(true);
                }
            } else {
                setResults([]);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [query, countryFilter]);


    // Group results
    const cities = results.filter(r => r.record.type === 'city');
    const areas = results.filter(r => r.record.type === 'area');
    const zips = results.filter(r => r.record.type === 'zip');

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className={cn("relative w-full", className)}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <input
                        className={cn(
                            "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10",
                            className
                        )}
                        placeholder={placeholder}
                        value={query || value} // Show query if typing, else selected value
                        onChange={(e) => {
                            setQuery(e.target.value);
                            if (!open && e.target.value) setOpen(true);
                        }}
                        onClick={() => setOpen(true)}
                    />
                </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align="start">
                <Command shouldFilter={false}>
                    {/* We turn off internal filtering because we use our own search logic */}
                    {/* Hidden input to satisfy accessible command requirements if needed, but we drive via external input */}
                    <div className="hidden">
                        <CommandInput value={query} onValueChange={setQuery} />
                    </div>

                    <CommandList>
                        {query && results.length === 0 && (
                            <CommandEmpty>No location found.</CommandEmpty>
                        )}

                        {!query && (
                            <CommandGroup heading="Suggestions">
                                <CommandItem onSelect={() => {
                                    // "Near Me" Implementation Mock
                                    // ideally call a prop like onUseMyLocation
                                    devLog("Use my location clicked");
                                    // For now we just close, implementing fully would require Geolocation API integration
                                    setOpen(false);
                                }}>
                                    <MapPin className="mr-2 h-4 w-4 text-gold" />
                                    Use my current location
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {cities.length > 0 && (
                            <CommandGroup heading="Cities">
                                {cities.map(({ record }) => (
                                    <CommandItem
                                        key={record.id}
                                        value={record.name} // Unique enough for this list context
                                        onSelect={() => {
                                            const label = record.country === 'US'
                                                ? `${record.name}, ${record.state}`
                                                : `${record.name}, UK`;
                                            setValue(label);
                                            setQuery(""); // Clear query to show value
                                            onLocationSelect(record);
                                            setOpen(false);
                                        }}
                                    >
                                        <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                        <span>{record.name}</span>
                                        <span className="ml-1 text-muted-foreground">
                                            {record.country === 'US' ? `, ${record.state}` : ', UK'}
                                        </span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {areas.length > 0 && (
                            <CommandGroup heading="Areas">
                                {areas.map(({ record }) => (
                                    <CommandItem
                                        key={record.id}
                                        value={record.name + record.id}
                                        onSelect={() => {
                                            const label = `${record.name}, ${record.state} → ${record.anchor_city}`;
                                            setValue(label);
                                            setQuery("");
                                            onLocationSelect(record);
                                            setOpen(false);
                                        }}
                                    >
                                        <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                        <div className="flex flex-col">
                                            <span>{record.name}</span>
                                            <span className="text-xs text-muted-foreground">{record.anchor_city}, {record.state}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {zips.length > 0 && (
                            <CommandGroup heading="ZIP Codes">
                                {zips.map(({ record }) => (
                                    <CommandItem
                                        key={record.id}
                                        value={record.name}
                                        onSelect={() => {
                                            const label = `${record.zip} → ${record.anchor_city}, ${record.state}`;
                                            setValue(label);
                                            setQuery("");
                                            onLocationSelect(record);
                                            setOpen(false);
                                        }}
                                    >
                                        <MapPin className="mr-2 h-4 w-4 opacity-50" />
                                        <span>{record.zip}</span>
                                        <span className="ml-2 text-muted-foreground">→ {record.anchor_city}, {record.state}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}


