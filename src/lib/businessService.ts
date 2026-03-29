import { supabase } from './supabase';
import type { Business } from './businesses';
import { getBusinessById } from './businesses';
import { usCities, cities } from './trades';

import { fallbackEnrichment } from '@/data/fallback_enrichment';

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
function mapBusinessData(biz: any, userCoords?: { latitude: number, longitude: number }): Business {
    const dbSocials = biz.social_links || {};
    const fallbackSocials = fallbackEnrichment[biz.id] || {};

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
 * Fetch businesses from Supabase (Real, Verified Data Only)
 */
export async function fetchBusinesses(
    trade: string,
    city: string,
    countryCode: string = 'GB',
    userCoords?: { latitude: number, longitude: number },
    state?: string
): Promise<Business[]> {
    console.log(`[fetchBusinesses] CALL: trade=${trade}, city=${city}, state=${state}, countryCode=${countryCode}, coords=${JSON.stringify(userCoords)}`);

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

    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .in('trade', uniqueTrades)
        .eq('country_code', countryCode.toUpperCase());

    // OPTIMIZATION: State-level query (New)
    if (state && countryCode.toUpperCase() === 'US') {
        const { getCitiesForState } = await import('./trades');
        const stateCities = getCitiesForState(state);
        if (stateCities.length > 0) {
            console.log(`[fetchBusinesses] State query for ${state}: searching in ${stateCities.length} cities`);
            query = query.in('city', stateCities);
            searchCity = ""; // Suppress further city filtering
        }
    }

    // OPTIMIZATION: Direct City Match First (Fastest)
    if (searchCity && searchCity.trim() !== '') {
        // 1. Try exact match on city column (Indexed) - Limit 50 for speed
        const directQuery = supabase
            .from('businesses')
            .select('*, business_photos(*)')
            .in('trade', uniqueTrades)
            .eq('city', searchCity) // Uses Index
            .eq('country_code', countryCode.toUpperCase())
            .limit(50);

        const { data: directData, error: directError } = await directQuery;

        if (!directError && directData && directData.length > 0) {
            console.log(`[fetchBusinesses] Direct city match found: ${directData.length} results`);
            return directData.map((biz: any) => mapBusinessData(biz, userCoords))
                .sort((a, b) => {
                    if (a.tier === 'paid' && b.tier !== 'paid') return -1;
                    if (a.tier !== 'paid' && b.tier === 'paid') return 1;
                    if (userCoords && a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
                    return (b.priority_score || 0) - (a.priority_score || 0);
                });
        }

        // 2. If no direct match, try coverage_areas (Slower but necessary for service areas)
        const cityWithSpaces = searchCity.replace(/-/g, ' ');
        query = query.contains('coverage_areas', [cityWithSpaces]);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching dynamic businesses:', error);
        return [];
    }

    // FALLBACK: If no results found with city filter, try broader query
    let allBusinesses = data || [];
    if (allBusinesses.length === 0 && searchCity) {
        console.log('[fetchBusinesses] No results for city, trying broader query');
        
        let fallbackQuery = supabase
            .from('businesses')
            .select('*, business_photos(*)')
            .in('trade', uniqueTrades)
            .eq('country_code', countryCode.toUpperCase());

        // CRITICAL FIX: Ensure fallback stays within the same state if US
        if (state && countryCode.toUpperCase() === 'US') {
            const { getCitiesForState } = await import('./trades');
            const stateCities = getCitiesForState(state);
            if (stateCities.length > 0) {
                fallbackQuery = fallbackQuery.in('city', stateCities);
            } else {
                // If state specified but no cities found, DO NOT fallback to broad national query
                return [];
            }
        } else if (searchCity && countryCode.toUpperCase() === 'US') {
            // If city specified in US but no results, do not fallback to national
            return [];
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(50);
        if (!fallbackError && fallbackData) {
            allBusinesses = fallbackData;
        }
    }

    return (allBusinesses || []).map((biz: any) => mapBusinessData(biz, userCoords))
        .sort((a, b) => {
            // 1. Paid businesses always first
            if (a.tier === 'paid' && b.tier !== 'paid') return -1;
            if (a.tier !== 'paid' && b.tier === 'paid') return 1;

            // 2. Proximity sort if available
            if (userCoords && a.distance !== undefined && b.distance !== undefined) {
                return a.distance - b.distance;
            }

            // 3. Fallback to priority score
            return (b.priority_score || 0) - (a.priority_score || 0);
        });
}

export async function fetchBusinessById(id: string): Promise<Business | null> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('id', id)
        .maybeSingle();

    if (!error && data) {
        return mapBusinessData(data);
    }

    return null;
}

export async function fetchAllBusinesses(limit = 100, countryCode?: string): Promise<Business[]> {
    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)');

    if (countryCode) {
        query = query.eq('country_code', countryCode.toUpperCase());
    }

    const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching all businesses:', error);
        return [];
    }

    return (data || []).map(biz => mapBusinessData(biz));
}

export async function searchBusinesses(query: string, countryCode: string = 'GB'): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('country_code', countryCode.toUpperCase())
        .or(`name.ilike.%${query}%,trade.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error searching businesses:', error);
        return [];
    }

    return (data || []).map(biz => mapBusinessData(biz));
}

export async function fetchPaidBusinesses(trade?: string, city?: string, countryCode?: string): Promise<Business[]> {
    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('is_premium', true);

    if (trade) query = query.eq('trade', trade.toLowerCase().replace('emergency-', ''));
    if (city) query = query.eq('city', city);
    if (countryCode) query = query.eq('country_code', countryCode.toUpperCase());

    const { data, error } = await query
        .order('rating', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching paid businesses:', error);
        return [];
    }

    return (data || []).map(biz => mapBusinessData(biz));
}
