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
import { UK_CITY_GROUPS } from "@/lib/uk-city-grouping"

interface UKCityComboboxProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function UKCityCombobox({ value, onValueChange, placeholder = "Select City...", className }: UKCityComboboxProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "h-12 md:h-11 w-12 md:w-full justify-center md:justify-between rounded-full border border-gold/50 bg-white/80 dark:bg-black/40 backdrop-blur-md px-0 md:px-4 hover:bg-gold/10 hover:border-gold transition-all flex items-center shadow-sm shrink-0",
                        className
                    )}
                >
                    <div className="flex items-center justify-center md:justify-start md:gap-2">
                        <MapPin className="h-5 w-5 md:h-4 md:w-4 shrink-0 text-gold" />
                        <span className={cn("hidden md:inline truncate", !value && "text-muted-foreground")}>
                            {value ? value : placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50 md:ml-2 md:h-4 md:w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandList>
                        <CommandEmpty>No city found.</CommandEmpty>
                        {Object.entries(UK_CITY_GROUPS).map(([region, cities]) => (
                            <CommandGroup key={region} heading={region}>
                                {cities.map((city) => (
                                    <CommandItem
                                        key={city}
                                        value={city}
                                        onSelect={() => {
                                            onValueChange(city)
                                            setOpen(false)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === city ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {city}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
