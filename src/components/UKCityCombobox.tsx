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
                        "w-full justify-between rounded-full border-gold/50 bg-white/50 backdrop-blur-sm dark:bg-black/20 hover:bg-gold/5 hover:border-gold transition-colors",
                        className
                    )}
                >
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 shrink-0 text-gold" />
                        <span className={cn("truncate", !value && "text-muted-foreground")}>
                            {value || placeholder}
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
