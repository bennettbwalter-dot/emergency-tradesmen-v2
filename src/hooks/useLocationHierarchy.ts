import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Ideally this should be from a context or a shared lib file, but recreating here or importing if available
// We'll check if there is a shared supabase client file. usually 'src/lib/supabase.ts' or 'src/utils/supabase.ts'
// Based on 'apply_migration.js' it seems they use direct instantiation, but let's try to import from lib if possible.
// For now, I'll instantiate it here with env vars to be safe.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Import local valid data directly to ensure reliability
import usData from '@/lib/us_cities.json';

// Type definitions matching the JSON structure roughly
interface JsonState {
    name: string;
    slug: string;
    metros?: JsonMetro[];
}
interface JsonMetro {
    name: string;
    slug: string;
    cities?: JsonCity[];
}
interface JsonCity {
    name: string;
    slug: string;
    suburbs?: JsonSuburb[];
}
interface JsonSuburb {
    name: string;
    slug: string;
}

export interface Location {
    id: string;
    name: string;
    slug: string;
    type: 'state' | 'metro' | 'city' | 'suburb';
    path_slugs?: {
        state: string;
        metro?: string;
        city?: string;
        suburb?: string;
    };
    hierarchy_path?: string[];
}

export function useLocationHierarchy() {
    const [states, setStates] = useState<Location[]>([]);
    const [metros, setMetros] = useState<Location[]>([]);
    const [cities, setCities] = useState<Location[]>([]);
    const [suburbs, setSuburbs] = useState<Location[]>([]);

    const [selectedState, setSelectedState] = useState<Location | null>(null);
    const [selectedMetro, setSelectedMetro] = useState<Location | null>(null);
    const [selectedCity, setSelectedCity] = useState<Location | null>(null);
    const [selectedSuburb, setSelectedSuburb] = useState<Location | null>(null);

    const [loading, setLoading] = useState(false);

    // Initial Load: States from JSON
    useEffect(() => {
        console.log("HOOK: Loading states from JSON...", usData);
        if (!usData || !(usData as any).states) {
            console.error("HOOK: usData is missing 'states' property!", usData);
            return;
        }

        const loadedStates: Location[] = (usData as any).states.map((s: JsonState) => ({
            id: s.slug,
            name: s.name,
            slug: s.slug,
            type: 'state',
            path_slugs: { state: s.slug }
        }));
        // Sort alphabetically
        loadedStates.sort((a, b) => a.name.localeCompare(b.name));
        console.log(`HOOK: Loaded ${loadedStates.length} states.`);
        setStates(loadedStates);
    }, []);

    // Load Metros when State changes
    useEffect(() => {
        if (!selectedState) {
            setMetros([]);
            return;
        }

        // Find state in JSON
        const stateData = (usData as any).states.find((s: JsonState) => s.slug === selectedState.slug);
        if (stateData && stateData.metros) {
            const loadedMetros: Location[] = stateData.metros.map((m: JsonMetro) => ({
                id: m.slug,
                name: m.name,
                slug: m.slug,
                type: 'metro',
                path_slugs: {
                    state: selectedState.slug,
                    metro: m.slug
                }
            }));
            loadedMetros.sort((a, b) => a.name.localeCompare(b.name));
            setMetros(loadedMetros);
        } else {
            setMetros([]);
        }
    }, [selectedState]);

    // Load Cities when Metro changes
    useEffect(() => {
        if (!selectedState || !selectedMetro) {
            setCities([]);
            return;
        }

        const stateData = (usData as any).states.find((s: JsonState) => s.slug === selectedState.slug);
        const metroData = stateData?.metros?.find((m: JsonMetro) => m.slug === selectedMetro.slug);

        if (metroData && metroData.cities) {
            const loadedCities: Location[] = metroData.cities.map((c: JsonCity) => ({
                id: c.slug,
                name: c.name,
                slug: c.slug,
                type: 'city',
                path_slugs: {
                    state: selectedState.slug,
                    metro: selectedMetro.slug,
                    city: c.slug
                }
            }));
            loadedCities.sort((a, b) => a.name.localeCompare(b.name));
            setCities(loadedCities);
        } else {
            setCities([]);
        }
    }, [selectedMetro]);

    // Load Suburbs when City changes
    useEffect(() => {
        if (!selectedState || !selectedMetro || !selectedCity) {
            setSuburbs([]);
            return;
        }

        const stateData = (usData as any).states.find((s: JsonState) => s.slug === selectedState.slug);
        const metroData = stateData?.metros?.find((m: JsonMetro) => m.slug === selectedMetro.slug);
        const cityData = metroData?.cities?.find((c: JsonCity) => c.slug === selectedCity.slug);

        if (cityData && cityData.suburbs) {
            const loadedSuburbs: Location[] = cityData.suburbs.map((s: JsonSuburb) => ({
                id: s.slug,
                name: s.name,
                slug: s.slug,
                type: 'suburb',
                path_slugs: {
                    state: selectedState.slug,
                    metro: selectedMetro.slug,
                    city: selectedCity.slug,
                    suburb: s.slug
                }
            }));
            loadedSuburbs.sort((a, b) => a.name.localeCompare(b.name));
            setSuburbs(loadedSuburbs);
        } else {
            setSuburbs([]);
        }
    }, [selectedCity]);

    // Helper to reset lower levels
    const selectState = (state: Location | null) => {
        setSelectedState(state);
        setSelectedMetro(null);
        setSelectedCity(null);
        setSelectedSuburb(null);
    };

    const selectMetro = (metro: Location | null) => {
        setSelectedMetro(metro);
        setSelectedCity(null);
        setSelectedSuburb(null);
    };

    const selectCity = (city: Location | null) => {
        setSelectedCity(city);
        setSelectedSuburb(null);
    };

    const selectSuburb = (suburb: Location | null) => {
        setSelectedSuburb(suburb);
    };

    return {
        states,
        metros,
        cities,
        suburbs,
        selectedState,
        selectedMetro,
        selectedCity,
        selectedSuburb,
        selectState,
        selectMetro,
        selectCity,
        selectSuburb,
        loading
    };
}
