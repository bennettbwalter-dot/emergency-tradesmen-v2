import { findNearestCity } from "./cityCoordinates";
import { devLog } from "./devLog";

const REVERSE_GEOCODE_TIMEOUT_MS = 3000;

export async function reverseGeocode(
    lat: number,
    lng: number,
    countryCode: "GB" | "US"
): Promise<string | null> {
    const targetCountryCode = countryCode === "GB" ? "GB" : "US";

    // 1. Try BigDataCloud reverse geocode API (free, client-side friendly, no key)
    const bigDataCloudUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REVERSE_GEOCODE_TIMEOUT_MS);

    try {
        devLog(`Attempting reverse geocoding via BigDataCloud for coords: ${lat}, ${lng}`);
        const res = await fetch(bigDataCloudUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
            const data = await res.json();
            const resCountry = String(data.countryCode || "").toUpperCase();
            
            // Validate country code matches
            if (resCountry === targetCountryCode) {
                const city = data.city || data.locality;
                if (city && city.trim().length > 1) {
                    devLog(`Resolved city from BigDataCloud: ${city}`);
                    return city.trim();
                }
            } else {
                devLog(`BigDataCloud returned country ${resCountry}, expected ${targetCountryCode}`);
            }
        }
    } catch (error) {
        clearTimeout(timeoutId);
        console.warn("BigDataCloud geocoding failed, falling back:", error);
    }

    // 2. Fall back to OSM Nominatim API
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=14&email=emergencytradesmen@outlook.com`;
    const controllerNom = new AbortController();
    const timeoutIdNom = setTimeout(() => controllerNom.abort(), REVERSE_GEOCODE_TIMEOUT_MS);
    
    try {
        devLog(`Attempting reverse geocoding via Nominatim for coords: ${lat}, ${lng}`);
        const res = await fetch(nominatimUrl, {
            headers: { "Accept-Language": "en" },
            signal: controllerNom.signal
        });
        clearTimeout(timeoutIdNom);
        if (res.ok) {
            const data = await res.json();
            const resCountry = String(data.address?.country_code || "").toUpperCase();
            if (resCountry === targetCountryCode) {
                const resolvedCity = data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    data.address?.borough ||
                    data.address?.municipality ||
                    data.address?.suburb ||
                    data.address?.city_district ||
                    data.address?.neighbourhood ||
                    data.address?.county ||
                    null;
                if (resolvedCity && resolvedCity.trim().length > 1) {
                    devLog(`Resolved city from Nominatim: ${resolvedCity}`);
                    return resolvedCity.trim();
                }
            } else {
                devLog(`Nominatim returned country ${resCountry}, expected ${targetCountryCode}`);
            }
        }
    } catch (error) {
        clearTimeout(timeoutIdNom);
        console.warn("Nominatim geocoding failed:", error);
    }

    // 3. Fall back to local cityCoordinates search
    devLog(`Geocoding APIs failed. Falling back to local nearest city lookup.`);
    const nearest = findNearestCity(lat, lng, targetCountryCode);
    if (nearest) {
        devLog(`Resolved nearest supported city from local database: ${nearest.city}`);
        return nearest.city;
    }

    return null;
}
