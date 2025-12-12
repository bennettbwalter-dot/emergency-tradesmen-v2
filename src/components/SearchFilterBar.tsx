import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface FilterOptions {
    searchQuery: string;
    availability: "all" | "now" | "today" | "this-week";
    minRating: number;
    maxDistance: number;
    sortBy: "rating" | "distance" | "reviews" | "name";
    hasWebsite: boolean;
    is24Hours: boolean;
}

interface SearchFilterBarProps {
    filters: FilterOptions;
    onFiltersChange: (filters: FilterOptions) => void;
    resultsCount: number;
    totalCount: number;
}

export function SearchFilterBar({
    filters,
    onFiltersChange,
    resultsCount,
    totalCount,
}: SearchFilterBarProps) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const updateFilter = (key: keyof FilterOptions, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        onFiltersChange({
            searchQuery: "",
            availability: "all",
            minRating: 0,
            maxDistance: 50,
            sortBy: "rating",
            hasWebsite: false,
            is24Hours: false,
        });
    };

    const activeFiltersCount = [
        filters.availability !== "all",
        filters.minRating > 0,
        filters.maxDistance < 50,
        filters.hasWebsite,
        filters.is24Hours,
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search by business name, area, or service..."
                        value={filters.searchQuery}
                        onChange={(e) => updateFilter("searchQuery", e.target.value)}
                        className="pl-10 pr-10 h-12 bg-card border-border/50 focus:border-gold/50"
                    />
                    {filters.searchQuery && (
                        <button
                            onClick={() => updateFilter("searchQuery", "")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Filter Button */}
                <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="lg"
                            className="relative border-border/50 hover:border-gold/50 min-w-[120px]"
                        >
                            <SlidersHorizontal className="w-5 h-5 mr-2" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <Badge
                                    variant="default"
                                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-gold text-gold-foreground"
                                >
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="font-display text-2xl tracking-wide">
                                Filter Results
                            </SheetTitle>
                            <SheetDescription>
                                Refine your search to find the perfect tradesperson
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-8 space-y-6">
                            {/* Availability Filter */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Availability</Label>
                                <Select
                                    value={filters.availability}
                                    onValueChange={(value: any) =>
                                        updateFilter("availability", value)
                                    }
                                >
                                    <SelectTrigger className="bg-card border-border/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Availability</SelectItem>
                                        <SelectItem value="now">
                                            <span className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                                Available Now
                                            </span>
                                        </SelectItem>
                                        <SelectItem value="today">Available Today</SelectItem>
                                        <SelectItem value="this-week">This Week</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Rating Filter */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">
                                        Minimum Rating
                                    </Label>
                                    <span className="text-sm text-muted-foreground">
                                        {filters.minRating > 0
                                            ? `${filters.minRating}+ stars`
                                            : "Any"}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.minRating]}
                                    onValueChange={(value) => updateFilter("minRating", value[0])}
                                    max={5}
                                    step={0.5}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Any</span>
                                    <span>5 stars</span>
                                </div>
                            </div>

                            {/* Distance Filter */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-medium">Max Distance</Label>
                                    <span className="text-sm text-muted-foreground">
                                        {filters.maxDistance === 50
                                            ? "Any distance"
                                            : `${filters.maxDistance} miles`}
                                    </span>
                                </div>
                                <Slider
                                    value={[filters.maxDistance]}
                                    onValueChange={(value) =>
                                        updateFilter("maxDistance", value[0])
                                    }
                                    max={50}
                                    step={5}
                                    className="py-4"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>5 miles</span>
                                    <span>50+ miles</span>
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Sort By</Label>
                                <Select
                                    value={filters.sortBy}
                                    onValueChange={(value: any) => updateFilter("sortBy", value)}
                                >
                                    <SelectTrigger className="bg-card border-border/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating">Highest Rated</SelectItem>
                                        <SelectItem value="reviews">Most Reviews</SelectItem>
                                        <SelectItem value="distance">Nearest First</SelectItem>
                                        <SelectItem value="name">Name (A-Z)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Quick Filters */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Quick Filters</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-gold/30 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={filters.is24Hours}
                                            onChange={(e) =>
                                                updateFilter("is24Hours", e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                                        />
                                        <span className="text-sm">24/7 Emergency Service</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-gold/30 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={filters.hasWebsite}
                                            onChange={(e) =>
                                                updateFilter("hasWebsite", e.target.checked)
                                            }
                                            className="w-4 h-4 rounded border-border text-gold focus:ring-gold"
                                        />
                                        <span className="text-sm">Has Website</span>
                                    </label>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-border/30">
                                <Button
                                    variant="outline"
                                    onClick={clearFilters}
                                    className="flex-1"
                                >
                                    Clear All
                                </Button>
                                <Button
                                    onClick={() => setIsFilterOpen(false)}
                                    className="flex-1 bg-gold hover:bg-gold/90 text-gold-foreground"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Results Count & Active Filters */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium text-foreground">{resultsCount}</span> of{" "}
                    <span className="font-medium text-foreground">{totalCount}</span> results
                </p>

                {activeFiltersCount > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {filters.availability !== "all" && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => updateFilter("availability", "all")}
                            >
                                {filters.availability === "now"
                                    ? "Available Now"
                                    : filters.availability === "today"
                                        ? "Today"
                                        : "This Week"}
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {filters.minRating > 0 && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => updateFilter("minRating", 0)}
                            >
                                {filters.minRating}+ stars
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {filters.maxDistance < 50 && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => updateFilter("maxDistance", 50)}
                            >
                                Within {filters.maxDistance} miles
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {filters.is24Hours && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => updateFilter("is24Hours", false)}
                            >
                                24/7 Service
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        {filters.hasWebsite && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() => updateFilter("hasWebsite", false)}
                            >
                                Has Website
                                <X className="w-3 h-3 ml-1" />
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="text-xs h-7"
                        >
                            Clear all
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
