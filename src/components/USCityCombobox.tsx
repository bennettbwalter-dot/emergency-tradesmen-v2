import * as React from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import usData from '@/lib/us_cities.json'

interface State { name: string; code: string; slug: string; metros?: Metro[]; }
interface Metro { name: string; slug: string; cities?: City[]; }
interface City { name: string; slug: string; suburbs?: Suburb[]; }
interface Suburb { name: string; slug: string; }

interface FlattenedLocation {
    id: string;
    name: string;
    displayName: string;
    stateCode: string;
    stateSlug: string;
    metroSlug: string;
    citySlug: string;
}

interface USCityComboboxProps {
    className?: string;
    placeholder?: string;
    onLocationSelect: (record: any) => void;
}

const US_STATES = (usData as any).states as State[];

// Pre-flatten all cities for fast search
const ALL_LOCATIONS: FlattenedLocation[] = [];
US_STATES.forEach(state => {
    state.metros?.forEach(metro => {
        metro.cities?.forEach(city => {
            ALL_LOCATIONS.push({
                id: `${state.slug}-${city.slug}`,
                name: city.name,
                displayName: `${city.name}, ${state.code}`,
                stateCode: state.code,
                stateSlug: state.slug,
                metroSlug: metro.slug,
                citySlug: city.slug,
            });
        });
    });
});

// Sort alphabetically
ALL_LOCATIONS.sort((a, b) => a.displayName.localeCompare(b.displayName));

export function USCityCombobox({ className, placeholder = "City, State", onLocationSelect }: USCityComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [selectedLocation, setSelectedLocation] = React.useState<FlattenedLocation | null>(null);

    const handleSelect = (location: FlattenedLocation) => {
        setSelectedLocation(location);
        setOpen(false);

        // Build record for parent
        const record = {
            id: location.citySlug,
            type: 'city',
            country: 'US',
            name: location.name,
            state: location.stateCode,
            anchor_city: location.name,
            anchor_slug: location.citySlug,
            area_slug: location.citySlug,
            metro_slug: location.metroSlug,
            path_slugs: {
                state: location.stateSlug,
                metro: location.metroSlug,
                city: location.citySlug,
                suburb: ''
            }
        };
        onLocationSelect(record);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-11 w-full justify-between rounded-full border border-gold/50 bg-white/80 dark:bg-black/40 backdrop-blur-md px-4 hover:bg-gold/10 hover:border-gold transition-all flex items-center shadow-sm",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 shrink-0 text-gold" />
                        <span className={cn("truncate", !selectedLocation && "text-muted-foreground")}>
                            {selectedLocation?.displayName || placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        <CommandGroup heading="US Cities">
                            {ALL_LOCATIONS.slice(0, 100).map((loc) => (
                                <CommandItem
                                    key={loc.id}
                                    value={loc.displayName}
                                    onSelect={() => handleSelect(loc)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedLocation?.id === loc.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {loc.displayName}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
