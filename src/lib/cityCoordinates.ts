// City coordinates for major UK cities (approximate center points)
export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
    "Manchester": { lat: 53.4808, lng: -2.2426 },
    "Birmingham": { lat: 52.4862, lng: -1.8904 },
    "Leeds": { lat: 53.8008, lng: -1.5491 },
    "Sheffield": { lat: 53.3811, lng: -1.4701 },
    "Nottingham": { lat: 52.9548, lng: -1.1581 },
    "Leicester": { lat: 52.6369, lng: -1.1398 },
    "Derby": { lat: 52.9226, lng: -1.4746 },
    "Coventry": { lat: 52.4068, lng: -1.5197 },
    "Wolverhampton": { lat: 52.5869, lng: -2.1282 },
    "Stoke-on-Trent": { lat: 53.0027, lng: -2.1794 },
    "Liverpool": { lat: 53.4084, lng: -2.9916 },
    "Preston": { lat: 53.7632, lng: -2.7031 },
    "Bolton": { lat: 53.5768, lng: -2.4282 },
    "Oldham": { lat: 53.5444, lng: -2.1169 },
    "Rochdale": { lat: 53.6097, lng: -2.1561 },
    "Bradford": { lat: 53.7960, lng: -1.7594 },
    "Huddersfield": { lat: 53.6458, lng: -1.7850 },
    "York": { lat: 53.9600, lng: -1.0873 },
    "Hull": { lat: 53.7457, lng: -0.3367 },
    "Doncaster": { lat: 53.5228, lng: -1.1285 },
    "Northampton": { lat: 52.2405, lng: -0.9027 },
    "Milton Keynes": { lat: 52.0406, lng: -0.7594 },
    "Luton": { lat: 51.8787, lng: -0.4200 },
    "Bedford": { lat: 52.1363, lng: -0.4667 },
    "Peterborough": { lat: 52.5695, lng: -0.2405 },
    "Cambridge": { lat: 52.2053, lng: 0.1218 },
    "Norwich": { lat: 52.6309, lng: 1.2974 },
    "Ipswich": { lat: 52.0594, lng: 1.1556 },
    "Reading": { lat: 51.4543, lng: -0.9781 },
    "Oxford": { lat: 51.7520, lng: -1.2577 },
    "Swindon": { lat: 51.5558, lng: -1.7797 },
    "Cheltenham": { lat: 51.8994, lng: -2.0783 },
    "Gloucester": { lat: 51.8642, lng: -2.2382 },
    "Worcester": { lat: 52.1920, lng: -2.2200 },
    "Hereford": { lat: 52.0565, lng: -2.7160 },
    "Shrewsbury": { lat: 52.7081, lng: -2.7539 },
    "Telford": { lat: 52.6766, lng: -2.4469 },
    "Cannock": { lat: 52.6910, lng: -2.0280 },
    "Tamworth": { lat: 52.6336, lng: -1.6950 },
    "Nuneaton": { lat: 52.5230, lng: -1.4685 },
    "Rugby": { lat: 52.3708, lng: -1.2653 },
    "Bath": { lat: 51.3751, lng: -2.3599 },
    "Brighton & Hove": { lat: 50.8225, lng: -0.1372 },
    "Bristol": { lat: 51.4545, lng: -2.5879 },
    "Canterbury": { lat: 51.2802, lng: 1.0789 },
    "Carlisle": { lat: 54.8951, lng: -2.9382 },
    "Chelmsford": { lat: 51.7356, lng: 0.4685 },
    "Chester": { lat: 53.1906, lng: -2.8908 },
    "Chichester": { lat: 50.8365, lng: -0.7792 },
    "Colchester": { lat: 51.8917, lng: 0.9027 },
    "Durham": { lat: 54.7761, lng: -1.5733 },
    "Ely": { lat: 52.3984, lng: 0.2622 },
    "Exeter": { lat: 50.7184, lng: -3.5339 },
    "Lancaster": { lat: 54.0465, lng: -2.8007 },
    "Lichfield": { lat: 52.6817, lng: -1.8262 },
    "Lincoln": { lat: 53.2307, lng: -0.5406 },
    "London": { lat: 51.5074, lng: -0.1278 },
    "Newcastle-upon-Tyne": { lat: 54.9783, lng: -1.6178 },
    "Plymouth": { lat: 50.3755, lng: -4.1427 },
    "Portsmouth": { lat: 50.8198, lng: -1.0880 },
    "Ripon": { lat: 54.1380, lng: -1.5236 },
    "Salford": { lat: 53.4875, lng: -2.2901 },
    "Salisbury": { lat: 51.0693, lng: -1.7944 },
    "Southampton": { lat: 50.9097, lng: -1.4044 },
    "Southend-on-Sea": { lat: 51.5460, lng: 0.7075 },
    "St Albans": { lat: 51.7520, lng: -0.3360 },
    "Sunderland": { lat: 54.9069, lng: -1.3838 },
    "Truro": { lat: 50.2632, lng: -5.0510 },
    "Wakefield": { lat: 53.6833, lng: -1.4958 },
    "Wells": { lat: 51.2093, lng: -2.6470 },
    "Winchester": { lat: 51.0632, lng: -1.3080 },
    "Westminster": { lat: 51.4975, lng: -0.1357 },
    "Warrington": { lat: 53.3900, lng: -2.5970 },
    "Wigan": { lat: 53.5450, lng: -2.6325 },
    "Middlesbrough": { lat: 54.5742, lng: -1.2350 },
    "Blackpool": { lat: 53.8175, lng: -3.0357 },
    "Barnsley": { lat: 53.5526, lng: -1.4797 },
};

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Find the nearest city from a given coordinate
 * Returns the city name and distance
 */
export function findNearestCity(lat: number, lng: number): {
    city: string;
    distance: number;
} {
    let nearestCity = "";
    let minDistance = Infinity;

    for (const [city, coords] of Object.entries(cityCoordinates)) {
        const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
        if (distance < minDistance) {
            minDistance = distance;
            nearestCity = city;
        }
    }

    return { city: nearestCity, distance: minDistance };
}
