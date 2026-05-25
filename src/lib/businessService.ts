import { supabase } from './supabase';
import { devLog } from "@/lib/devLog";
import type { Business } from './businesses';
import { getBusinessById } from './businesses';
import { usCities, cities } from './trades';
import type { TrustEvidenceRow, TrustRegion } from "@/lib/trust/trustBadges";
import { regionFromCountryCode } from "@/lib/trust/trustBadges";

const PLACEHOLDER_NAMES = ['Pending Verification Profile', 'Your Business Name'];
const isRealBusiness = (biz: any) => biz?.name && !PLACEHOLDER_NAMES.includes(biz.name) && biz.tier !== 'ghosted';
const BUSINESS_QUERY_LIMIT = 300;
const BUSINESS_ORDER = 'is_premium.desc.nullslast,priority_score.desc.nullslast,rating.desc.nullslast';
const ENABLE_FIELD_EVIDENCE = import.meta.env.VITE_ENABLE_FIELD_EVIDENCE === 'true';

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
        verified_at: biz.verified_at || null,
        claim_status: biz.claim_status || 'unclaimed',
        header_image_url: biz.header_image_url,
        vehicle_image_url: biz.vehicle_image_url,
        country_code: biz.country_code || 'GB',
        trust_badges: biz.trust_badges || [],
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
class SupabaseRestError extends Error {
    status: number;

    constructor(status: number, statusText: string) {
        super(`Supabase REST error: ${status} ${statusText}`);
        this.name = 'SupabaseRestError';
        this.status = status;
    }
}

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
        throw new SupabaseRestError(response.status, response.statusText);
    }

    const countHeader = response.headers.get('x-total-count');
    const data = await response.json();
    return { data, error: null as null, count: countHeader ? parseInt(countHeader) : null };
}

let evidenceTableUnavailable = false;

async function fetchSafeEvidenceForBusinessIds(
    businessIds: string[],
    region: TrustRegion
): Promise<Record<string, TrustEvidenceRow[]>> {
    if (!ENABLE_FIELD_EVIDENCE) return {};

    const uniqueIds = [...new Set(businessIds.filter(Boolean))];
    if (uniqueIds.length === 0 || evidenceTableUnavailable) return {};

    const idList = uniqueIds.map(id => encodeURIComponent(id)).join(',');
    const url = `/rest/v1/public_business_field_evidence?select=*&region=eq.${region}&business_id=in.(${idList})&order=verified_at.desc`;
    let data: TrustEvidenceRow[] | null = null;

    try {
        const response = await supabaseFetch(url);
        data = response.data;
    } catch (error) {
        if (error instanceof SupabaseRestError) {
            evidenceTableUnavailable = true;
            return {};
        }
        console.warn('Trust evidence lookup failed; continuing without evidence badges.', error);
        return {};
    }

    return (data || []).reduce((acc: Record<string, TrustEvidenceRow[]>, row: TrustEvidenceRow) => {
        if (!acc[row.business_id]) acc[row.business_id] = [];
        acc[row.business_id].push(row);
        return acc;
    }, {});
}

async function attachEvidence(businesses: Business[], region: TrustRegion): Promise<Business[]> {
    const evidenceByBusinessId = await fetchSafeEvidenceForBusinessIds(
        businesses.map((business) => business.id),
        region
    );

    return businesses.map((business) => ({
        ...business,
        field_evidence: evidenceByBusinessId[business.id] || [],
    }));
}

/**
 * Fetch businesses from Supabase (real listing data only)
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
    const normalizedTrade = normalizeTradeSlug(trade);

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
        stateCities = getCitiesForState(normalizeUSStateLookup(state));
        if (stateCities.length > 0) {
            devLog(`[fetchBusinesses] State query for ${state}: searching in ${stateCities.length} cities`);
            searchCity = "";
        }
    }

    // OPTIMIZATION: Direct City Match First (Fastest)
    if (searchCity && searchCity.trim() !== '') {
        const tradeParams = `trade=in.(${uniqueTrades.map(encodeURIComponent).join(',')})`;
        const directUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&city=eq.${encodeURIComponent(searchCity)}&country_code=eq.${countryCode.toUpperCase()}&order=${BUSINESS_ORDER}&limit=${BUSINESS_QUERY_LIMIT}`;

        try {
            const { data: directData } = await supabaseFetch(directUrl);

            if (directData && directData.length > 0) {
                devLog(`[fetchBusinesses] Direct city match found: ${directData.length} results`);
                const businesses = await Promise.all(directData.filter(isRealBusiness).map((biz: any) => mapBusinessData(biz, userCoords)));
                const businessesWithEvidence = await attachEvidence(businesses, regionFromCountryCode(countryCode));
                return businessesWithEvidence
                    .sort((a, b) => {
                        if (a.tier === 'paid' && b.tier !== 'paid') return -1;
                        if (a.tier !== 'paid' && b.tier === 'paid') return 1;
                        if (userCoords && a.distance !== undefined && b.distance !== undefined) return a.distance - b.distance;
                        return (b.priority_score || 0) - (a.priority_score || 0);
                    });
            }
        } catch (err) {
            devLog('[fetchBusinesses] Direct city match query failed:', err);
        }

        // 2. If no direct match, try coverage_areas via broader query
    }

    // Build main query
    const tradeParams = `trade=in.(${uniqueTrades.map(encodeURIComponent).join(',')})`;
    let queryUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&country_code=eq.${countryCode.toUpperCase()}&order=${BUSINESS_ORDER}&limit=${BUSINESS_QUERY_LIMIT}`;

    const isCoverageQuery = !(stateCities.length > 0) && !!(searchCity && searchCity.trim() !== '');

    if (stateCities.length > 0) {
        queryUrl += `&city=in.(${stateCities.map(encodeURIComponent).join(',')})`;
    } else if (searchCity && searchCity.trim() !== '') {
        const cityWithSpaces = searchCity.replace(/-/g, ' ');
        queryUrl += `&coverage_areas=cs.${encodeURIComponent(`{"${cityWithSpaces.replace(/"/g, '\\"')}"}`)}`;
    }

    let data: any[] | null = null;

    if (isCoverageQuery) {
        // Run containment query with a tight timeout to prevent statement timeouts
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2 seconds timeout
        try {
            const response = await supabaseFetch(queryUrl, { signal: controller.signal });
            data = response.data;
        } catch (err) {
            devLog('[fetchBusinesses] coverage_areas containment query failed or timed out, trying broader query...', err);
            data = null;
        } finally {
            clearTimeout(timeoutId);
        }
    } else {
        try {
            const response = await supabaseFetch(queryUrl);
            data = response.data;
        } catch (err) {
            devLog('[fetchBusinesses] Main query failed, continuing...', err);
            data = null;
        }
    }

    // FALLBACK: If no results found with city filter, try broader query
    let allBusinesses = data || [];
    if (allBusinesses.length === 0 && searchCity) {
        devLog('[fetchBusinesses] No results for city, trying broader query');

        let fallbackUrl = `/rest/v1/businesses?select=*,business_photos(*)&${tradeParams}&country_code=eq.${countryCode.toUpperCase()}&order=${BUSINESS_ORDER}&limit=${BUSINESS_QUERY_LIMIT}`;

        if (stateCities.length > 0) {
            fallbackUrl += `&city=in.(${stateCities.map(encodeURIComponent).join(',')})`;
        }

        try {
            const { data: fallbackData } = await supabaseFetch(fallbackUrl);
            if (fallbackData) {
                allBusinesses = fallbackData;
            }
        } catch (err) {
            devLog('[fetchBusinesses] Fallback broader query failed:', err);
        }
    }

    const mappedBusinesses = await Promise.all((allBusinesses || []).filter(isRealBusiness).map((biz: any) => mapBusinessData(biz, userCoords)));
    const mappedBusinessesWithEvidence = await attachEvidence(mappedBusinesses, regionFromCountryCode(countryCode));
    return mappedBusinessesWithEvidence
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
        const business = await mapBusinessData(data[0]);
        const [businessWithEvidence] = await attachEvidence([business], regionFromCountryCode(business.country_code));
        return businessWithEvidence;
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

function normalizeTradeSlug(trade: string): string {
    return trade
        .toLowerCase()
        .trim()
        .replace(/^emergency-/, '')
        .replace(/\s+/g, '-')
        .replace(/s$/, '');
}

function normalizeUSStateLookup(state: string): string {
    const normalized = state.toLowerCase().trim();
    const slugToCode: Record<string, string> = {
        'alabama': 'al',
        'alaska': 'ak',
        'arizona': 'az',
        'arkansas': 'ar',
        'california': 'ca',
        'colorado': 'co',
        'connecticut': 'ct',
        'delaware': 'de',
        'florida': 'fl',
        'georgia': 'ga',
        'hawaii': 'hi',
        'idaho': 'id',
        'illinois': 'il',
        'indiana': 'in',
        'iowa': 'ia',
        'kansas': 'ks',
        'kentucky': 'ky',
        'louisiana': 'la',
        'maine': 'me',
        'maryland': 'md',
        'massachusetts': 'ma',
        'michigan': 'mi',
        'minnesota': 'mn',
        'mississippi': 'ms',
        'missouri': 'mo',
        'montana': 'mt',
        'nebraska': 'ne',
        'nevada': 'nv',
        'new-hampshire': 'nh',
        'new-jersey': 'nj',
        'new-mexico': 'nm',
        'new-york': 'ny',
        'north-carolina': 'nc',
        'north-dakota': 'nd',
        'ohio': 'oh',
        'oklahoma': 'ok',
        'oregon': 'or',
        'pennsylvania': 'pa',
        'rhode-island': 'ri',
        'south-carolina': 'sc',
        'south-dakota': 'sd',
        'tennessee': 'tn',
        'texas': 'tx',
        'utah': 'ut',
        'vermont': 'vt',
        'virginia': 'va',
        'washington': 'wa',
        'west-virginia': 'wv',
        'wisconsin': 'wi',
        'wyoming': 'wy',
        'district-of-columbia': 'dc',
    };

    return slugToCode[normalized] || normalized;
}
