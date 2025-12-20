import { supabase } from './supabase';
import type { Business } from './businesses';

/**
 * Fetch businesses from Supabase database
 */
import { businessListings } from './businesses';
/**
 * Helper to map Supabase business data to the Business interface
 */
function mapBusinessData(biz: any): Business {
    return mapBusinessData(data);
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
            })) || [])
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
