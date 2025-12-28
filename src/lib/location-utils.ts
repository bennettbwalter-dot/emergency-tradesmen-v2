import { cities } from './trades';

// Coordinates for our supported cities to enable "Nearest Neighbor" search
// This allows us to map "Brixton" -> "London" purely via math
export const SUPPORTED_LOCATIONS: Record<string, { lat: number; lon: number }> = {
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
    // Defaults for safety - mapped roughly to regions if exact city missing
    "Westminster": { lat: 51.4975, lon: -0.1357 },
};

// OpenStreetMap (Nominatim) is free and requires no API key for low-volume methods
// We respect their usage policy by including a User-Agent
export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; displayName: string } | null> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", UK")}&limit=1`, {
            headers: {
                'User-Agent': 'EmergencyTradesmen/1.0 (emergencytradesmen@outlook.com)'
            }
        });

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

// Haversine Formula to find distance between two points in KM
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

export function findNearestSupportedCity(lat: number, lon: number): { city: string; distance: number } | null {
    let nearestCity: string | null = null;
    let minDistance = Infinity;

    // Iterate over KNOWN supported cities to find the closest one
    // Prioritize keys in SUPPORTED_LOCATIONS, fall back to simple array search if needed
    for (const city of cities) {
        const coords = SUPPORTED_LOCATIONS[city];
        // If we haven't mapped this city manually yet, skip (or add it above)
        if (!coords) continue;

        const dist = getDistanceFromLatLonInKm(lat, lon, coords.lat, coords.lon);
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
