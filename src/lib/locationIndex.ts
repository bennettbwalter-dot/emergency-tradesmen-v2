import usCityList from './us_cities.json';
import { getStateForCity } from './usCityStates';

export type LocationType = 'city' | 'area' | 'zip';

export interface LocationRecord {
    id: string;
    type: LocationType;
    country: 'US'; // Strictly US only
    name: string;
    state: string; // State Code for US
    anchor_city: string; // The primary metro this belongs to (or itself)
    anchor_slug: string;
    area_slug: string | null;
    zip?: string;
    search_text: string; // Pre-processed text for faster searching
}

// Manual ZIP code mapping for demonstration (since we don't have a full DB)
const SAMPLE_ZIPS: Record<string, { city: string, state: string, area?: string }> = {
    "10001": { city: "New York City", state: "NY" },
    "90210": { city: "Los Angeles", state: "CA", area: "Beverly Hills" },
    "14612": { city: "Rochester", state: "NY", area: "Greece" },
    "60601": { city: "Chicago", state: "IL" },
    "75001": { city: "Dallas", state: "TX", area: "Addison" }
};

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function generateLocationIndex(): LocationRecord[] {
    const index: LocationRecord[] = [];

    // 1. Process US Cities and Areas
    (usCityList as Array<string | { name: string, state?: string, suburbs?: string[] }>).forEach((item) => {
        let cityName: string;
        let state: string;
        let suburbs: string[] = [];

        if (typeof item === 'string') {
            cityName = item.trim();
            state = getStateForCity(cityName) || 'US';
        } else {
            cityName = item.name.trim();
            state = item.state || getStateForCity(cityName) || 'US';
            suburbs = item.suburbs || [];
        }

        const citySlug = slugify(cityName);

        // Add City Record
        index.push({
            id: `us-city-${citySlug}-${state}`,
            type: 'city',
            country: 'US',
            name: cityName,
            state: state,
            anchor_city: cityName,
            anchor_slug: citySlug,
            area_slug: null,
            search_text: `${cityName.toLowerCase()} ${state.toLowerCase()}`,
        });

        // Add Suburb (Area) Records
        suburbs.forEach(suburb => {
            const suburbSlug = slugify(suburb);
            index.push({
                id: `us-area-${suburbSlug}-${citySlug}`,
                type: 'area',
                country: 'US',
                name: suburb,
                state: state,
                anchor_city: cityName,
                anchor_slug: citySlug,
                area_slug: suburbSlug,
                search_text: `${suburb.toLowerCase()} ${cityName.toLowerCase()} ${state.toLowerCase()}`,
            });
        });
    });

    // 2. Add ZIP Code Records (US Only)
    Object.entries(SAMPLE_ZIPS).forEach(([zip, data]) => {
        const citySlug = slugify(data.city);
        const areaSlug = data.area ? slugify(data.area) : null;

        index.push({
            id: `us-zip-${zip}`,
            type: 'zip',
            country: 'US',
            name: zip,
            state: data.state,
            anchor_city: data.city,
            anchor_slug: citySlug,
            area_slug: areaSlug,
            zip: zip,
            search_text: zip
        });
    });

    return index;
}

// Memoize the index
let _cachedIndex: LocationRecord[] | null = null;
export function getLocationIndex(): LocationRecord[] {
    if (!_cachedIndex) {
        _cachedIndex = generateLocationIndex();
    }
    return _cachedIndex;
}

export interface SearchResult {
    record: LocationRecord;
    score: number;
}

export function searchLocations(query: string, countryCode?: 'US' | 'GB', limit: number = 10): SearchResult[] {
    // If GB is requested, we return strictly empty in US system
    if (countryCode === 'GB') {
        return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return [];

    const index = getLocationIndex();
    const results: SearchResult[] = [];

    // Simple scoring heuristic
    for (const record of index) {
        // Enforce strict US filter (though index is now US only)
        if (record.country !== 'US') continue;

        let score = 0;
        const nameLower = record.name.toLowerCase();

        // Check match on Name (City/Area/Zip)
        if (nameLower === normalizedQuery) {
            score = 100; // Exact match
        } else if (nameLower.startsWith(normalizedQuery)) {
            score = 80; // Prefix match
        } else if (nameLower.includes(normalizedQuery)) {
            score = 50; // Partial match
        } else if (record.type !== 'zip' && record.search_text.includes(normalizedQuery)) {
            // Matches state or parent city in search text
            score = 20;
        }

        // Boost for ZIP type if query matches a ZIP exactly
        if (record.type === 'zip' && record.zip === normalizedQuery) {
            score = 110;
        }

        // Boost for Cities over Areas if scores are equal (usually prefer main city)
        if (record.type === 'city') score += 5;

        if (score > 0) {
            results.push({ record, score });
        }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
