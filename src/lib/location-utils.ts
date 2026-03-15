import { cities } from './trades';

// Coordinates for our supported cities to enable "Nearest Neighbor" search
// This allows us to map "Brixton" -> "London" purely via math
export const SUPPORTED_LOCATIONS: Record<string, { lat: number; lon: number }> = {
    // UK Cities
    "Manchester": { lat: 53.4808, lon: -2.2426 },
    "Birmingham": { lat: 52.4862, lon: -1.8904 },
    "Leeds": { lat: 53.8008, lon: -1.5491 },
    "Sheffield": { lat: 53.3811, lon: -1.4701 },
    "Nottingham": { lat: 52.9548, lon: -1.1581 },
    "Leicester": { lat: 52.6369, lon: -1.1398 },
    "Derby": { lat: 52.9225, lon: -1.4746 },
    "Coventry": { lat: 52.4068, lon: -1.5197 },
    "Wolverhampton": { lat: 52.5862, lon: -2.1288 },
    "Stoke-on-Trent": { lat: 53.0027, lon: -2.1794 },
    "Liverpool": { lat: 53.4084, lon: -2.9916 },
    "Preston": { lat: 53.7632, lon: -2.7031 },
    "Bolton": { lat: 53.5769, lon: -2.4282 },
    "Oldham": { lat: 53.5409, lon: -2.1114 },
    "Rochdale": { lat: 53.6097, lon: -2.1558 },
    "Bradford": { lat: 53.7957, lon: -1.7593 },
    "Huddersfield": { lat: 53.6458, lon: -1.7850 },
    "York": { lat: 53.9615, lon: -1.0700 },
    "Hull": { lat: 53.7457, lon: -0.3367 },
    "Doncaster": { lat: 53.5228, lon: -1.1288 },
    "London": { lat: 51.5074, lon: -0.1278 },
    "Newcastle-upon-Tyne": { lat: 54.9783, lon: -1.6178 },
    "Plymouth": { lat: 50.3755, lon: -4.1427 },
    "Portsmouth": { lat: 50.8198, lon: -1.0879 },
    "Southampton": { lat: 50.9097, lon: -1.4044 },
    "Bristol": { lat: 51.4545, lon: -2.5879 },
    "Brighton & Hove": { lat: 50.8225, lon: -0.1372 },
    "Reading": { lat: 51.4543, lon: -0.9781 },
    "Oxford": { lat: 51.7520, lon: -1.2577 },
    "Cambridge": { lat: 52.2053, lon: 0.1218 },
    "Westminster": { lat: 51.4975, lon: -0.1357 },

    // US Cities
    "Los Angeles": { lat: 34.0522, lon: -118.2437 },
    "San Diego": { lat: 32.7157, lon: -117.1611 },
    "San Francisco": { lat: 37.7749, lon: -122.4194 },
    "Sacramento": { lat: 38.5816, lon: -121.4944 },
    "Dallas": { lat: 32.7767, lon: -96.7970 },
    "Houston": { lat: 29.7604, lon: -95.3698 },
    "Austin": { lat: 30.2672, lon: -97.7431 },
    "San Antonio": { lat: 29.4241, lon: -98.4936 },
    "Miami": { lat: 25.7617, lon: -80.1918 },
    "Orlando": { lat: 28.5383, lon: -81.3792 },
    "Phoenix": { lat: 33.4484, lon: -112.0740 },
    "Seattle": { lat: 47.6062, lon: -122.3321 },
    "New York": { lat: 40.7128, lon: -74.0060 },
};

// Nominatim Geocoding
export async function geocodeLocation(query: string, countryCode: string = 'GB'): Promise<{ lat: number; lon: number; displayName: string } | null> {
    try {
        const countrySuffix = countryCode.toUpperCase() === 'US' ? ', USA' : ', UK';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s Timeout

        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + countrySuffix)}&limit=1`, {
            headers: {
                'User-Agent': 'EmergencyTradesmen/1.0 (emergencytradesmen@outlook.com)'
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) return null;

        const data = await response.json();
        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        }
    } catch (error) {
        console.error("Geocoding failed:", error);
    }
    return null;
}

// Haversine Formula...
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

import { usCities } from './trades';

export function findNearestSupportedCity(lat: number, lon: number, countryCode: string = 'GB'): { city: string; distance: number } | null {
    let nearestCity: string | null = null;
    let minDistance = Infinity;

    // Use appropriate list based on country
    const cityList = countryCode.toUpperCase() === 'US' ? usCities : cities;
    const { cityCoordinates } = require('./cityCoordinates');
    const { usCityCoordinates } = require('./usCityCoordinates');
    const coordsMap = countryCode.toUpperCase() === 'US' ? usCityCoordinates : cityCoordinates;

    for (const city of cityList) {
        const coords = coordsMap[city];
        if (!coords) continue;

        const dist = getDistanceFromLatLonInKm(lat, lon, coords.lat, coords.lng || coords.lon);
        if (dist < minDistance) {
            minDistance = dist;
            nearestCity = city;
        }
    }

    if (nearestCity) {
        return { city: nearestCity, distance: minDistance };
    }
    return null;
}

// Regex for valid UK Postcodes (Case Insensitive)
export const POSTCODE_REGEX = /([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})/;

// Helper to find City from Postcode or Area Name
import { cityPostcodes } from './cityPostcodes';

export function getCityFromQuery(query: string): string | null {
    const q = query.trim();

    // 1. Check if it looks like a postcode start (e.g. "SW1", "M1")
    // Simple heuristic: 1-2 letters + 1-2 numbers at start
    const postcodeStart = q.match(/^([a-zA-Z]{1,2}[0-9]{1,2})/);
    if (postcodeStart) {
        const prefix = postcodeStart[0].toUpperCase();

        // Search cityPostcodes values for this prefix
        const foundCity = Object.keys(cityPostcodes).find(city => {
            const code = cityPostcodes[city];
            return code.startsWith(prefix);
        });
        if (foundCity) return foundCity;
    }

    // 2. Check for Area Names (Reverse Lookup)
    // "Brixton" -> "London" (if Brixton is in our map and mapped to London's postcode?) 
    // Actually cityPostcodes maps "Brixton" -> "SW2 1AA".
    // We need to know which *Primary City* that Area belongs to.

    // For now, if we match an Area aka "Brixton", we return "Brixton".
    // But the routing needs a VALID CITY from the `cities` list.
    // We need a mapping of Area -> Primary City.
    // Existing logic in chat-logic.ts uses geocoding "Brixton" -> lat/lon -> Nearest Supported City (London).
    // So we don't strictly need a map here IF we rely on geocoding.

    // However, for direct string matching speed:
    const directMatch = Object.keys(cityPostcodes).find(k => k.toLowerCase() === q.toLowerCase());
    if (directMatch) return directMatch; // Returns "Brixton"

    return null;
}
