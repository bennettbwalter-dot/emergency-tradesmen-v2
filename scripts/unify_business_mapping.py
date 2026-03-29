import os
import re

def unify_mapping():
    path = os.path.join('..', 'src', 'lib', 'businessService.ts')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Define the new helper function
    helper_function = """
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
        last_available_ping: biz.last_available_ping
    };
}
"""

    # Add the helper at the top (after imports)
    content = content.replace("import { businessListings } from './businesses';", "import { businessListings } from './businesses';" + helper_function)

    # Replace mapping logic in fetchBusinesses
    # Search for the map/forEach logic
    pattern_fetch = r'const dynamicBiz: Business = \{[\s\S]+?            \};'
    content = re.sub(pattern_fetch, 'const dynamicBiz = mapBusinessData(biz);', content)

    # Replace mapping logic in fetchBusinessById
    pattern_id = r'return \{[\s\S]+?            whatsapp_number: data.whatsapp_number\n        \};'
    content = re.sub(pattern_id, 'return mapBusinessData(data);', content)

    # Replace mapping logic in fetchAllBusinesses
    pattern_all = r'return \(data \|\| \[\]\)\.map\(biz => \(\{[\s\S]+?        \}\)\);'
    content = re.sub(pattern_all, 'return (data || []).map(biz => mapBusinessData(biz));', content)

    # Replace mapping logic in searchBusinesses
    pattern_search = r'return \(data \|\| \[\]\)\.map\(biz => \(\{[\s\S]+?        \}\)\);'
    content = re.sub(pattern_search, 'return (data || []).map(biz => mapBusinessData(biz));', content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

unify_mapping()
