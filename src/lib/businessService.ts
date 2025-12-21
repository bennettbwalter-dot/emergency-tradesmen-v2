import { supabase } from './supabase';
import type { Business } from './businesses';
import { businessListings, getBusinessById } from './businesses';

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
        vehicle_image_url: biz.vehicle_image_url
    };
}

/**
 * Fetch businesses using Hybrid Strategy
 */
export async function fetchBusinesses(trade: string, city: string): Promise<Business[]> {
    const staticBusinesses = businessListings[city.toLowerCase()]?.[trade.toLowerCase()] || [];

    const { data: supabaseBusinesses, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('trade', trade.toLowerCase())
        .eq('city', city)
        .eq('verified', true);

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

    return (data || []).map(biz => mapBusinessData(biz));
}

export async function searchBusinesses(query: string): Promise<Business[]> {
    const { data, error } = await supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('verified', true)
        .or(`name.ilike.%${query}%,trade.ilike.%${query}%`)
        .order('rating', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error searching businesses:', error);
        return [];
    }

    return (data || []).map(biz => mapBusinessData(biz));
}

export async function fetchPaidBusinesses(trade?: string, city?: string): Promise<Business[]> {
    let query = supabase
        .from('businesses')
        .select('*, business_photos(*)')
        .eq('verified', true)
        .eq('is_premium', true)
        .order('rating', { ascending: false })
        .limit(10);

    if (trade) query = query.eq('trade', trade);
    if (city) query = query.eq('city', city);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching paid businesses:', error);
        return [];
    }

    return (data || []).map(biz => mapBusinessData(biz));
}
