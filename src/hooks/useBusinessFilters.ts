import { useState, useMemo } from "react";
import { Business } from "@/lib/businesses";
import { FilterOptions } from "@/components/SearchFilterBar";

export function useBusinessFilters(businesses: Business[] | null) {
    const [filters, setFilters] = useState<FilterOptions>({
        searchQuery: "",
        availability: "all",
        minRating: 0,
        maxDistance: 50,
        sortBy: "rating",
        hasWebsite: false,
        is24Hours: false,
    });

    const filteredAndSortedBusinesses = useMemo(() => {
        if (!businesses) return [];

        let filtered = [...businesses];

        // Search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (business) =>
                    business.name.toLowerCase().includes(query) ||
                    business.address?.toLowerCase().includes(query)
            );
        }

        // Rating filter
        if (filters.minRating > 0) {
            filtered = filtered.filter(
                (business) => business.rating >= filters.minRating
            );
        }

        // 24/7 filter
        if (filters.is24Hours) {
            filtered = filtered.filter((business) => business.isOpen24Hours);
        }

        // Website filter
        if (filters.hasWebsite) {
            filtered = filtered.filter((business) => business.website);
        }

        // Availability filter (for now, just filter by 24/7 for "now")
        if (filters.availability === "now") {
            filtered = filtered.filter((business) => business.isOpen24Hours);
        }

        // Sort
        filtered.sort((a, b) => {
            // Tier 1: Premium/Paid Status
            const aPremium = a.is_premium || a.tier === 'paid';
            const bPremium = b.is_premium || b.tier === 'paid';
            if (aPremium && !bPremium) return -1;
            if (!aPremium && bPremium) return 1;

            // Tier 2: Trust Score Descending (5 to 0)
            const aScore = a.trust_score || 0;
            const bScore = b.trust_score || 0;
            if (aScore !== bScore) {
                return bScore - aScore;
            }

            // Tier 3: Verified Status (Only if scores tied)
            if (a.verified && !b.verified) return -1;
            if (!a.verified && b.verified) return 1;

            // Tier 4: User Selection
            switch (filters.sortBy) {
                case "rating":
                    return b.rating - a.rating;
                case "reviews":
                    return b.reviewCount - a.reviewCount;
                case "name":
                    return a.name.localeCompare(b.name);
                case "distance":
                    return 0;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [businesses, filters]);

    return {
        filters,
        setFilters,
        filteredBusinesses: filteredAndSortedBusinesses,
        totalCount: businesses?.length || 0,
        resultsCount: filteredAndSortedBusinesses.length,
    };
}
