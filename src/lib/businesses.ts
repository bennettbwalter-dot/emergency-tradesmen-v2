// Interfaces kept for type safety across the app
export interface PricingTier {
    name: string;
    description: string;
    features: string[];
}

export interface Pricing {
    callOutFee: number;
    hourlyRate: number;
    emergency24hSurcharge?: number; // Percentage (e.g., 50 for 50% extra)
    minimumCharge?: number;
    typicalJobs?: {
        name: string;
        priceRange: string;
        duration: string;
    }[];
    whatsIncluded: string[];
    tier?: 'budget' | 'standard' | 'premium';
}

export interface BusinessPhoto {
    id: string;
    url: string;
    isPrimary: boolean;
    altText?: string;
}

export interface Business {
    id: string;
    name: string;
    rating: number;
    reviewCount: number;
    address?: string;
    hours: string;
    isOpen24Hours: boolean;
    phone?: string;
    email?: string;
    website?: string;
    featuredReview?: string;
    pricing?: Pricing;
    isAvailableNow?: boolean;
    trade?: string;
    city?: string;
    photos?: BusinessPhoto[];
    tier?: 'free' | 'paid';
    verified?: boolean;
    priority_score?: number;
    // Premium subscriber fields
    logo_url?: string;
    premium_description?: string;
    services_offered?: string[];
    coverage_areas?: string[];
    is_premium?: boolean;
    owner_user_id?: string;
    whatsapp_number?: string;
    last_available_ping?: string;
    header_image_url?: string;
    vehicle_image_url?: string;
    postalCode?: string;
    social_links?: SocialLinks;
    latitude?: number;
    longitude?: number;
    country_code?: string;
    trust_score?: number;
}

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string; // X
    tiktok?: string;
}

export function isBusinessAvailable(business: Business): boolean {
    // 1. Explicit "Live" toggle or recent ping (Premium/Claimed feature)
    if (!!business.isAvailableNow || (!!business.last_available_ping && new Date(business.last_available_ping) > new Date(Date.now() - 3600000))) {
        return true;
    }

    // 2. Fallback: If 24/7
    if (business.isOpen24Hours) return true;
    if (business.hours && business.hours.toLowerCase().includes("24 hours")) return true;

    // 3. Time Parsing Logic for static strings (e.g. "Open · Closes 8 PM")
    if (business.hours) {
        const now = new Date();
        const nowHour = now.getHours();
        const nowMinute = now.getMinutes();

        const lowerHours = business.hours.toLowerCase();

        // If it says "Opens ...", it implies it is currently closed
        if (lowerHours.includes("opens")) return false;

        // If it says "Closes X PM/AM"
        if (lowerHours.includes("closes")) {
            try {
                // Regex to find time: "closes 5 pm", "closes 5:30 pm", "closes 8pm"
                const match = lowerHours.match(/closes\s+(\d+)(?::(\d+))?\s*(am|pm)/);
                if (match) {
                    let hour = parseInt(match[1]);
                    const minute = match[2] ? parseInt(match[2]) : 0;
                    const ampm = match[3];

                    if (ampm === "pm" && hour !== 12) hour += 12;
                    if (ampm === "am" && hour === 12) hour = 0;

                    // Compare times
                    if (nowHour < hour) return true;
                    if (nowHour === hour && nowMinute < minute) return true;
                    return false; // Past closing time
                }
            } catch (e) {
                // Fallback if parsing fails but text says "Open"
                return lowerHours.includes("open") && !lowerHours.includes("closed");
            }
        }

        // Final fallback for simple "Open" text if no time found
        if (lowerHours.includes("open") && !lowerHours.includes("closed")) return true;
    }

    return false;
}

export interface BusinessListings {
    [city: string]: {
        [trade: string]: Business[];
    };
}

/**
 * STRICT DATA INTEGRITY:
 * Removed 45,000+ lines of mock listings and procedural generation logic.
 * Only real, verified data from Supabase is allowed in the application.
 */
export const businessListings: BusinessListings = {};

export function getBusinessListings(city: string, trade: string, countryCode?: string): Business[] {
    // Always return empty array from static data. Real data is fetched via businessService.ts from Supabase.
    return [];
}

export function getBusinessById(id: string): { business: Business; city: string; trade: string } | null {
    // Static lookup disabled. Real data is fetched via businessService.ts from Supabase.
    return null;
}
