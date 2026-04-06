import { trackEvent } from './analytics';
import { devLog } from "@/lib/devLog";

export interface CaliforniaMarketMetrics {
    city: string;
    pageViews: number;
    leads: number;
    conversionRate: number;
    averageResponseTime: number;
    topTrades: string[];
}

const CALIFORNIA_CITIES = ['Los Angeles', 'San Diego', 'San Francisco', 'Sacramento'] as const;
type CaliforniaCity = typeof CALIFORNIA_CITIES[number];

/**
 * Track California-specific page view events
 */
export function trackCaliforniaPageView(city: CaliforniaCity, trade: string, path: string) {
    trackEvent('California Market', 'Page View', `${city} - ${trade}`);

    // Track specific California concerns
    if (trade === 'gas-engineer' || trade === 'plumber') {
        trackEvent('California HVAC', 'Interest', city);
    }

    // Log for analytics dashboard
    devLog(`[CA Analytics] ${city} - ${trade} page view`);
}

/**
 * Track California lead generation events
 */
export function trackCaliforniaLead(city: CaliforniaCity, trade: string, source: string) {
    trackEvent('California Market', 'Lead Generated', `${city} - ${trade}`);
    trackEvent('Lead Source', source, city);

    devLog(`[CA Analytics] Lead: ${city} - ${trade} from ${source}`);
}

/**
 * Track California-specific search queries
 */
export function trackCaliforniaSearch(city: CaliforniaCity, query: string) {
    const earthquakeRelated = /earthquake|seismic|retrofit/i.test(query);
    const hvacRelated = /hvac|ac|air conditioning|heating/i.test(query);
    const droughtRelated = /water|drought|conservation/i.test(query);

    if (earthquakeRelated) {
        trackEvent('California Concerns', 'Earthquake Search', city);
    }

    if (hvacRelated) {
        trackEvent('California Concerns', 'HVAC Search', city);
    }

    if (droughtRelated) {
        trackEvent('California Concerns', 'Water Conservation', city);
    }

    trackEvent('California Market', 'Search', `${city} - ${query}`);
}

/**
 * Track California contractor engagement
 */
export function trackCaliforniaContractorClick(
    city: CaliforniaCity,
    trade: string,
    contractorId: string,
    action: 'phone' | 'website' | 'quote'
) {
    trackEvent('California Engagement', `Contractor ${action}`, `${city} - ${trade}`);
    trackEvent('Contractor Action', action, contractorId);

    devLog(`[CA Analytics] ${action} click: ${city} - ${trade} - ${contractorId}`);
}

/**
 * Track California market response times
 */
export function trackCaliforniaResponseTime(city: CaliforniaCity, responseMinutes: number) {
    trackEvent('California Performance', 'Response Time', city, responseMinutes);

    // Alert if response time is unusually high
    if (responseMinutes > 120) {
        console.warn(`[CA Analytics] High response time in ${city}: ${responseMinutes} minutes`);
    }
}

/**
 * Get California market performance summary
 */
export async function getCaliforniaMarketSummary(): Promise<CaliforniaMarketMetrics[]> {
    // This would integrate with your analytics backend
    // For now, return placeholder structure
    return CALIFORNIA_CITIES.map(city => ({
        city,
        pageViews: 0,
        leads: 0,
        conversionRate: 0,
        averageResponseTime: 0,
        topTrades: [],
    }));
}

/**
 * Check if a city is a California market
 */
export function isCaliforniaCity(city: string): city is CaliforniaCity {
    return CALIFORNIA_CITIES.includes(city as CaliforniaCity);
}

/**
 * Track California-specific emergency types
 */
export function trackCaliforniaEmergency(city: CaliforniaCity, emergencyType: string) {
    trackEvent('California Emergencies', emergencyType, city);

    // Track California-specific emergencies
    const californiaSpecific = [
        'earthquake damage',
        'wildfire preparation',
        'drought-related',
        'extreme heat',
        'mudslide damage',
    ];

    if (californiaSpecific.some(type => emergencyType.toLowerCase().includes(type))) {
        trackEvent('California Specific Emergency', emergencyType, city);
    }
}

export { CALIFORNIA_CITIES };
