import { supabase } from './supabase';
import type { Business } from './businesses';
import { businessListings, getBusinessById } from './businesses';
import { usCities, cities } from './trades';

/**
 * Helper to map Supabase business data to the Business interface
 */
function mapBusinessData(biz: any): Business {
    return {
        id: biz.id,
        name: biz.name || "Untitled Business",
        rating: Number(biz.rating) || 5.0,
        reviewCount: biz.review_count || 0,
        address: biz.address,
        hours: biz.hours || '24/7 Emergency Service',
        isOpen24Hours: biz.is_open_24_hours !== false,
        phone: biz.phone,
        website: biz.website,
        featuredReview: biz.featured_review,
        isAvailableNow: biz.is_available_now !== false,
        trade: biz.trade,
        city: biz.city,
        // Robust photo mapping
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
        // Premium fields
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
        country_code: biz.country_code || 'GB'
    };
}

/**
 * Fetch businesses using Hybrid Strategy
 */
export async function fetchBusinesses(trade: string, city: string, countryCode: string = 'GB'): Promise<Business[]> {
    console.log(`[fetchBusinesses] CALL: trade=${trade}, city=${city}, countryCode=${countryCode}`);
    console.log(`[fetchBusinesses] usCities available? ${Array.isArray(usCities)} length=${usCities?.length}`);
    let staticBusinesses: Business[] = [];
    // Normalize trade slug to match static data keys (e.g. "emergency-plumber" -> "plumber")
    const normalizedTrade = trade.toLowerCase().replace('emergency-', '');

    // Variable to hold the actual city name found in static data (or original input)
    let searchCity = city;

    // If city contains a specific value, try to find a matching key in static data
    if (city) {
        // 1. Direct match (fast path)
        if (businessListings[city.toLowerCase()]?.[normalizedTrade]) {
            staticBusinesses = businessListings[city.toLowerCase()][normalizedTrade];
            searchCity = city; // Assume lowercase key matches input
        } else {
            // 2. Fuzzy match: Iterate keys to handle "Milton Keynes" vs "milton-keynes"
            const normalizedInput = city.toLowerCase().replace(/[^a-z0-9]/g, '');

            // A. Check matches in Static Data Keys
            const matchingKey = Object.keys(businessListings).find(key =>
                key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput
            );

            if (matchingKey) {
                // FOUND IT! Capture the correct key for Supabase query
                searchCity = matchingKey;
                if (businessListings[matchingKey]?.[normalizedTrade]) {
                    staticBusinesses = businessListings[matchingKey][normalizedTrade];
                }
            } else {
                // B. Check matches in the MASTER UK CITIES LIST (for Supabase-only cities)
                // This fixes the "99% of areas empty" issue where data exists in DB but not static JSON
                const matchingCityList = (cities as readonly string[]).find(c =>
                    c.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedInput
                );
                if (matchingCityList) {
                    searchCity = matchingCityList;
                }
            }
        }
    } else if (countryCode.toUpperCase() === 'GB') {
        // If NO specific city and we are in UK mode, AGGREGATE all static UK listings
        // We assume businessListings contains valid UK data (Legacy)

        Object.keys(businessListings).forEach(cityKey => {
            const cityBiz = businessListings[cityKey][normalizedTrade];
            if (cityBiz) {
                staticBusinesses = [...staticBusinesses, ...cityBiz];
            }
        });
    }

    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('trade', normalizedTrade)
        .eq('country_code', countryCode.toUpperCase());

    if (searchCity && searchCity.trim() !== '') {
        // Handle both hyphenated (URL-style) and space-separated (DB-style) city names
        const cityWithSpaces = searchCity.replace(/-/g, ' ');
        if (searchCity.includes('-')) {
            query = query.or(`city.ilike."${searchCity}",city.ilike."${cityWithSpaces}"`);
        } else {
            query = query.ilike('city', searchCity);
        }
    }

    const { data: supabaseBusinesses, error } = await query;

    if (error) {
        console.error('Error fetching dynamic businesses:', error);
        return staticBusinesses;
    }

    const businessMap = new Map<string, Business>();
    staticBusinesses.forEach(biz => businessMap.set(biz.id, biz));

    if (supabaseBusinesses) {
        supabaseBusinesses.forEach((biz: any) => {
            businessMap.set(biz.id, mapBusinessData(biz));
        });
    }

    const mergedList = Array.from(businessMap.values());
    return mergedList.sort((a, b) => {
        if (a.tier === 'paid' && b.tier !== 'paid') return -1;
        if (a.tier !== 'paid' && b.tier === 'paid') return 1;
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

    // Fallback to static or generated data using the helper from businesses.ts
    // This handles both static lists AND procedurally generated listings (e.g. london-breakdown-1)
    const result = getBusinessById(id);
    if (result) {
        return result.business;
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
