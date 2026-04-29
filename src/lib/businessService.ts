import { supabase } from './supabase';
import { devLog } from "@/lib/devLog";
import type { Business } from './businesses';
import { getBusinessById } from './businesses';
import { usCities, cities } from './trades';

const PLACEHOLDER_NAMES = ['Pending Verification Profile', 'Your Business Name'];
const isRealBusiness = (biz: any) => biz?.name && !PLACEHOLDER_NAMES.includes(biz.name) && biz.tier !== 'ghosted';

function toPostgresArrayLiteral(values: string[]): string {
    const escapedValues = values.map(value => `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    return `{${escapedValues.join(',')}}`;
}

// Lazy-loaded enrichment data — avoids bundling 3.3 MB JSON
let _fallbackEnrichment: Record<string, any> | null = null;
async function getFallbackEnrichment(): Promise<Record<string, any>> {
    if (_fallbackEnrichment) return _fallbackEnrichment;
    try {
        const res = await fetch('/data/fallback-enrichment.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        _fallbackEnrichment = await res.json();
    } catch {
        _fallbackEnrichment = {};
    }
    return _fallbackEnrichment!;
}

/**
 * Helper to map Supabase business data to the Business interface
 */
/**
 * Distance calculation using Haversine formula
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Helper to map Supabase business data to the Business interface
 */
async function mapBusinessData(biz: any, userCoords?: { latitude: number, longitude: number }): Promise<Business> {
    const dbSocials = biz.social_links || {};
    const enrichment = await getFallbackEnrichment();
    const fallbackSocials = enrichment[biz.id] || {};

    let website = biz.website;
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = `https://${website}`;
    }

    const mergedSocials = { ...dbSocials, ...fallbackSocials };

    const business: Business = {
        id: biz.id,
        name: biz.name || "Untitled Business",
        rating: Number(biz.rating) || 5.0,
        reviewCount: biz.review_count || 0,
        address: biz.address,
        hours: biz.hours || '24/7 Emergency Service',
        isOpen24Hours: biz.is_open_24_hours !== false,
        phone: biz.phone,
        website: website,
        featuredReview: biz.featured_review,
        isAvailableNow: biz.is_available_now !== false,
        trade: biz.trade,
        city: biz.city,
        photos: biz.photos && Array.isArray(biz.photos) && biz.photos.length > 0
            ? biz.photos.map((url: string, index: number) => ({
                id: `photo-${index}`,
                url: url,
                isPrimary: index === 0
            }))
            : (biz.business_photos?.map((p: any) => ({
                id: p.id,
                url: p.url,
                isPrimary: p.is_primary,
                altText: p.alt_text
            })) || []),
        tier: biz.tier || 'free',
        priority_score: biz.priority_score || 0,
        logo_url: biz.logo_url,
        premium_description: biz.premium_description,
        services_offered: biz.services_offered || [],
        coverage_areas: biz.coverage_areas || [],
        is_premium: biz.is_premium || biz.tier === 'paid' || false,
        owner_user_id: biz.owner_user_id,
        whatsapp_number: biz.whatsapp_number,
        last_available_ping: biz.last_available_ping,
        contact_name: biz.contact_name,
        verified: biz.verified || false,
        header_image_url: biz.header_image_url,
        vehicle_image_url: biz.vehicle_image_url,
        country_code: biz.country_code || 'GB',
        latitude: biz.latitude ? Number(biz.latitude) : undefined,
        longitude: biz.longitude ? Number(biz.longitude) : undefined,
        social_links: mergedSocials,
        trust_score: biz.trust_score
    };

    if (userCoords && business.latitude && business.longitude) {
        business.distance = getDistance(
            userCoords.latitude,
            userCoords.longitude,
            business.latitude,
            business.longitude
        );
    }

    return business;
}

/**
 * Direct REST API fetch helper (bypasses hanging JS SDK)
 */
async function supabaseFetch(url: string, options?: RequestInit) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}${url}`, {
        ...options,
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`Supabase REST error: ${response.status} ${response.statusText}`);
    }

    const countHeader = response.headers.get('x-total-count');
    const data = await response.json();
    return { data, error: null as null, count: countHeader ? parseInt(countHeader) : null };
}

/**
 * Fetch businesses from Supabase (Real, Verified Data Only)
 */
export async function fetchBusinesses(
    trade: string,
    city: string,
    countryCode: string = 'GB',
    userCoords?: { latitude: number, longitude: number },
    state?: string
): Promise<Business[]> {
    devLog(`[fetchBusinesses] CALL: trade=${trade}, city=${city}, state=${state}, countryCode=${countryCode}, coords=${JSON.stringify(userCoords)}`);

    // Normalize trade slug (e.g. "emergency-plumber" -> "plumber")
    const normalizedTrade = trade.toLowerCase().replace('emergency-', '');

    // Variable to hold the actual city name for Supabase query
    let searchCity = city;

    if (city) {
        const normalizedInput = city.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Find matching city in MASTER lists to ensure consistent DB queries
        const combinedCityListRaw = countryCode.toUpperCase() === 'US' ? usCities : cities;
        const matchingCityList = (combinedCityListRaw as readonly string[]).find(c =>
            c.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput
        );
        if (matchingCityList) {
            searchCity = matchingCityList;
        }
    }

    // Flexible trade matching: match "plumber" OR "emergency-plumber"
    const tradeVariations = [normalizedTrade, trade.toLowerCase()];
    if (trade.toLowerCase().startsWith('emergency-')) {
        tradeVariations.push(trade.toLowerCase().replace('emergency-', 'emergency '));
    }
    const uniqueTrades = [...new Set(tradeVariations)];

    // OPTIMIZATION: State-level query (New)
    let stateCities: string[] = [];
    if (state && countryCode.toUpperCase() === 'US') {
        const { getCitiesForState } = await import('./trades');
        stateCities = getCitiesForState(state);
        if (stateCities.length > 0) {
            devLog(`[fetchBusinesses] State query for ${state}: searching in ${stateCities.length} cities`);
            searchCity = "";
        }
    }

    // OPTIMIZATION: Direct City Match First (Fastest)
    if (searchCity && searchCity.trim() !== '') {
        const tradeParams = uniqueTrades.map(t => `trade=eq.${encodeURIComponent(t)}`).join('&');
        const directUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&city=eq.${encodeURIComponent(searchCity)}&country_code=eq.${countryCode.toUpperCase()}&limit=50`;

        const { data: directData } = await supabaseFetch(directUrl);

        if (directData && directData.length > 0) {
            devLog(`[fetchBusinesses] Direct city match found: ${directData.length} results`);
            const businesses = await Promise.all(directData.filter(isRealBusiness).map((biz: any) => mapBusinessData(biz, userCoords)));
            return businesses
                .sort((a, b) => {
                    if (a.tier === 'paid' && b.tier !== 'paid') return -1;
                    if (a.tier !== 'paid' && b.tier === 'paid') return 1;
                    if (userCoords && a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
                    return (b.priority_score || 0) - (a.priority_score || 0);
                });
        }

        // 2. If no direct match, try coverage_areas via broader query
    }

    // Build main query
    const tradeParams = uniqueTrades.map(t => `trade=eq.${encodeURIComponent(t)}`).join('&');
    let queryUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&country_code=eq.${countryCode.toUpperCase()}`;

    if (stateCities.length > 0) {
        const cityParam = stateCities.map(c => `city=eq.${encodeURIComponent(c)}`).join('&');
        queryUrl += `&${cityParam}`;
    } else if (searchCity && searchCity.trim() !== '') {
        const cityWithSpaces = searchCity.replace(/-/g, ' ');
        queryUrl += `&coverage_areas=cs.${encodeURIComponent(toPostgresArrayLiteral([cityWithSpaces]))}`;
    }

    const { data } = await supabaseFetch(queryUrl);

    // FALLBACK: If no results found with city filter, try broader query
    let allBusinesses = data || [];
    if (allBusinesses.length === 0 && searchCity) {
        devLog('[fetchBusinesses] No results for city, trying broader query');

        let fallbackUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&country_code=eq.${countryCode.toUpperCase()}&limit=50`;

        if (stateCities.length > 0) {
            const cityParam = stateCities.map(c => `city=eq.${encodeURIComponent(c)}`).join('&');
            fallbackUrl += `&${cityParam}`;
        } else if (countryCode.toUpperCase() === 'US') {
            return [];
        }

        const { data: fallbackData } = await supabaseFetch(fallbackUrl);
        if (fallbackData) {
            allBusinesses = fallbackData;
        }
    }

    const mappedBusinesses = await Promise.all((allBusinesses || []).filter(isRealBusiness).map((biz: any) => mapBusinessData(biz, userCoords)));
    return mappedBusinesses
        .sort((a, b) => {
            if (a.tier === 'paid' && b.tier !== 'paid') return -1;
            if (a.tier !== 'paid' && b.tier === 'paid') return 1;

            if (userCoords && a.distance !== undefined && b.distance !== undefined) {
                return a.distance - b.distance;
            }

            return (b.priority_score || 0) - (a.priority_score || 0);
        });
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
    const { data } = await supabaseFetch(`/rest/v1/businesses?select=*,business_photos(*)&id=eq.${encodeURIComponent(id)}`);

    if (data && data.length > 0) {
        return await mapBusinessData(data[0]);
    }

    return null;
}

export async function fetchAllBusinesses(limit = 100, countryCode?: string): Promise<Business[]> {
    let url = `/rest/v1/businesses?select=*,business_photos(*)&order=rating.desc&limit=${limit}`;
    if (countryCode) url += `&country_code=eq.${countryCode.toUpperCase()}`;

    const { data } = await supabaseFetch(url);

    if (!data) {
        console.error('Error fetching all businesses: no data returned');
        return [];
    }

    return Promise.all(data.map(biz => mapBusinessData(biz)));
}

export async function searchBusinesses(query: string, countryCode: string = 'GB'): Promise<Business[]> {
    const url = `/rest/v1/businesses?select=*,business_photos(*)&country_code=eq.${countryCode.toUpperCase()}&or=name.ilike.%25${encodeURIComponent(query)}%25,trade.ilike.%25${encodeURIComponent(query)}%25&order=rating.desc&limit=20`;

    const { data } = await supabaseFetch(url);

    if (!data) {
        console.error('Error searching businesses: no data returned');
        return [];
    }

    return Promise.all(data.map(biz => mapBusinessData(biz)));
}

export async function fetchPaidBusinesses(trade?: string, city?: string, countryCode?: string): Promise<Business[]> {
    let url = `/rest/v1/businesses?select=*,business_photos(*)&is_premium=eq.true&order=rating.desc&limit=10`;
    if (trade) url += `&trade=eq.${trade.toLowerCase().replace('emergency-', '')}`;
    if (city) url += `&city=eq.${encodeURIComponent(city)}`;
    if (countryCode) url += `&country_code=eq.${countryCode.toUpperCase()}`;

    const { data } = await supabaseFetch(url);

    if (!data) {
        console.error('Error fetching paid businesses: no data returned');
        return [];
    }

    return Promise.all(data.map(biz => mapBusinessData(biz)));
}
