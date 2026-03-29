import { supabase } from './supabase';
import type { Business } from './businesses';

/**
 * Fetch businesses from Supabase database
 */
import { businessListings } from './businesses';

/**
 * Fetch businesses using Hybrid Strategy:
 * 1. Load Static Data (Free Tier)
 * 2. Fetch Supabase Data (Premium Tier)
 * 3. Merge: Supabase overrides Static if ID matches
 */
export async function fetchBusinesses(trade: string, city: string): Promise<Business[]> {
    // 1. Get Static Data
    const staticBusinesses = businessListings[city.toLowerCase()]?.[trade.toLowerCase()] || [];

    // 2. Get Supabase Data
    const { data: supabaseBusinesses, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('trade', trade.toLowerCase())
        .eq('city', city) // partial match logic could be added later
        .eq('verified', true);

    if (error) {
        console.error('Error fetching dynamic businesses:', error);
        // Fallback to static data only
        return staticBusinesses;
    }

    // 3. Merge Strategy
    // Create a map for fast lookup
    const businessMap = new Map<string, Business>();

    // A. Add Static entries first
    staticBusinesses.forEach(biz => businessMap.set(biz.id, biz));

    // B. Add/Override with Supabase entries
    if (supabaseBusinesses) {
        supabaseBusinesses.forEach((biz: any) => {
            const dynamicBiz: Business = {
                id: biz.id,
                name: biz.name,
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
                photos: biz.business_photos?.map((p: any) => ({
                    id: p.id,
                    url: p.url,
                    isPrimary: p.is_primary,
                    altText: p.alt_text
                })) || [],
                tier: biz.tier, // 'paid' from DB overrides this
                priority_score: biz.priority_score,
                // Premium fields
                logo_url: biz.logo_url,
                premium_description: biz.premium_description,
                services_offered: biz.services_offered || [],
                coverage_areas: biz.coverage_areas || [],
                is_premium: biz.is_premium || false,
                owner_user_id: biz.owner_user_id,
                whatsapp_number: biz.whatsapp_number
            };

            // This set() will overwrite if ID exists (Promotion), or add new if not (New Premium)
            businessMap.set(biz.id, dynamicBiz);
        });
    }

    // Convert back to array
    const mergedList = Array.from(businessMap.values());

    // Sort: Premium/Paid top, then priority, then rating
    return mergedList.sort((a, b) => {
        if (a.tier === 'paid' && b.tier !== 'paid') return -1;
        if (a.tier !== 'paid' && b.tier === 'paid') return 1;
        return (b.priority_score || 0) - (a.priority_score || 0);
    });
}

/**
 * Fetch a single business by ID
 */
/**
 * Fetch a single business by ID (Hybrid: Supabase -> Static)
 */
export async function fetchBusinessById(id: string): Promise<Business | null> {
    // 1. Try Supabase First (Real-time data)
    const { data, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('id', id)
        .maybeSingle(); // maybeSingle avoids error if not found

    if (!error && data) {
        return {
            id: data.id,
            name: data.name,
            rating: Number(data.rating) || 5.0,
            reviewCount: data.review_count || 0,
            address: data.address,
            hours: data.hours || '24/7 Emergency Service',
            isOpen24Hours: data.is_open_24_hours !== false,
            phone: data.phone,
            website: data.website,
            featuredReview: data.featured_review,
            isAvailableNow: data.is_available_now !== false,
            trade: data.trade,
            city: data.city,
            photos: data.business_photos?.map((p: any) => ({
                id: p.id,
                url: p.url,
                isPrimary: p.is_primary,
                altText: p.alt_text
            })) || [],
            // Premium fields mapped ...
            is_premium: data.is_premium,
            whatsapp_number: data.whatsapp_number
        };
    }

    // 2. Fallback to Static Data
    // We need to search through the nested object structure
    for (const city in businessListings) {
        for (const trade in businessListings[city]) {
            const found = businessListings[city][trade].find(b => b.id === id);
            if (found) return found;
        }
    }

    return null;
}

/**
 * Fetch all verified businesses (for homepage, etc.)
 */
export async function fetchAllBusinesses(limit = 100): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('verified', true)
        .order('rating', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching all businesses:', error);
        return [];
    }

    return (data || []).map(biz => ({
        id: biz.id,
        name: biz.name,
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
        photos: biz.business_photos?.map((p: any) => ({
            id: p.id,
            url: p.url,
            isPrimary: p.is_primary,
            altText: p.alt_text
        })) || []
    }));
}

/**
 * Search businesses by name or trade
 */
export async function searchBusinesses(query: string): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('verified', true)
        .or(`name.ilike.%${query}%,trade.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error searching businesses:', error);
        return [];
    }

    return (data || []).map(biz => ({
        id: biz.id,
        name: biz.name,
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
        photos: [] // Search might not need photos immediately, but adding empty array for type safety
    }));
}

/**
 * Fetch paid/premium businesses for the availability carousel
 * Checks for businesses with active subscriptions (simulated for now)
 */
export async function fetchPaidBusinesses(trade?: string, city?: string): Promise<Business[]> {
    // In future: Join with subscriptions table using owner_id
    // For now: Fetch verified businesses and filter/simulate
    // This allows us to have "real" data structure even if empty

    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('verified', true)
        .order('rating', { ascending: false })
        .limit(10); // Sanity limit

    if (trade) {
        query = query.eq('trade', trade);
    }

    if (city) {
        query = query.eq('city', city);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching paid businesses:', error);
        return [];
    }

    // Filter logic: In a real scenario, we'd check against a list of subscribed user IDs
    // For now, return empty to force placeholders as per previous instruction, 
    // OR map the data if we want to show it.
    // The previous instruction was "return []" to force placeholders.
    // We'll keep returning [] here for consistency with the Availability Carousel requirement.

    return [];
}
