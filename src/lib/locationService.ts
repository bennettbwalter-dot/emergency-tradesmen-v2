export interface Suburb { name: string; slug: string; }
export interface City { name: string; slug: string; suburbs?: Suburb[]; }
export interface Metro { name: string; slug: string; cities?: City[]; }
export interface State { name: string; code: string; slug: string; metros?: Metro[]; }

// Cache the promise so we only load once
let loadPromise: Promise<{ states: State[] }> | null = null;
let cachedData: { states: State[] } | null = null;

export async function loadUSLocationData(): Promise<{ states: State[] }> {
    if (cachedData) return cachedData;

    if (!loadPromise) {
        // Dynamic import to split bundle
        loadPromise = import('@/lib/us_cities.json').then(module => {
            // The JSON import might be the module itself or module.default depending on config
            // us_cities.json has a "states" property at root based on previous inspection
            const data = (module as any).default || module;
            cachedData = data as unknown as { states: State[] };
            return cachedData;
        });
    }

    return loadPromise;
}

export async function searchCitiesInState(stateCode: string, query: string): Promise<any[]> {
    const data = await loadUSLocationData();
    const state = data.states.find(s => s.code === stateCode);
    if (!state || !state.metros) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const results: any[] = [];

    // Flatten and search on the fly to avoid pre-flattening 30k items
    for (const metro of state.metros) {
        if (!metro.cities) continue;
        for (const city of metro.cities) {
            // Match City Name
            if (city.name.toLowerCase().includes(normalizedQuery)) {
                results.push({
                    ...city,
                    metroSlug: metro.slug,
                    type: 'city'
                });
            }
            // Stop if we have enough results for a dropdown search
            if (results.length >= 50) return results;
        }
    }

    return results;
}

export async function getCitiesInState(stateCode: string, limit = 50, offset = 0): Promise<any[]> {
    const data = await loadUSLocationData();
    const state = data.states.find(s => s.code === stateCode);
    if (!state || !state.metros) return [];

    const results: any[] = [];
    let skipped = 0;

    for (const metro of state.metros) {
        if (!metro.cities) continue;
        for (const city of metro.cities) {
            if (skipped < offset) {
                skipped++;
                continue;
            }
            results.push({
                ...city,
                metroSlug: metro.slug,
                type: 'city'
            });
            if (results.length >= limit) return results;
        }
    }
    return results;
}
