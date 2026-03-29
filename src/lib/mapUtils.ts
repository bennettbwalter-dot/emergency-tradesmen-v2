
interface Coordinates {
    lat: number;
    lng: number;
}

interface ViewState {
    center: Coordinates;
    zoom: number;
}

// Center of USA
export const US_CENTER: Coordinates = { lat: 39.8283, lng: -98.5795 };
export const US_DEFAULT_ZOOM = 4;

// Center of UK
export const UK_CENTER: Coordinates = { lat: 54.5, lng: -4.0 };
export const UK_DEFAULT_ZOOM = 6;

// State Centers and Zoom Levels
// Zoom levels approximate fitting the state in a standard view
export const STATE_VIEWS: Record<string, ViewState> = {
    // ... (keep existing states)
    // Alabama
    "AL": { center: { lat: 32.8067, lng: -86.7911 }, zoom: 7 },
    // ...
    // Wyoming
    "WY": { center: { lat: 43.0759, lng: -107.2903 }, zoom: 7 },
};

import { getStateForCity } from './usCityStates';
import { getPostcodeForCity } from './cityPostcodes';

// UK Cities Coordinates (Examples for better fallback)
export const UK_CITY_VIEWS: Record<string, ViewState> = {
    "London": { center: { lat: 51.5074, lng: -0.1278 }, zoom: 10 },
    "Manchester": { center: { lat: 53.4808, lng: -2.2426 }, zoom: 11 },
    "Birmingham": { center: { lat: 52.4862, lng: -1.8904 }, zoom: 11 },
    "Leeds": { center: { lat: 53.8008, lng: -1.5491 }, zoom: 11 },
    "Liverpool": { center: { lat: 53.4084, lng: -2.9916 }, zoom: 11 },
    "Glasgow": { center: { lat: 55.8642, lng: -4.2518 }, zoom: 11 },
    "Edinburgh": { center: { lat: 55.9533, lng: -3.1883 }, zoom: 11 },
    "Bristol": { center: { lat: 51.4545, lng: -2.5879 }, zoom: 11 },
    "Cardiff": { center: { lat: 51.4816, lng: -3.1791 }, zoom: 11 },
    "Belfast": { center: { lat: 54.5973, lng: -5.9301 }, zoom: 11 },
    "Newcastle": { center: { lat: 54.9783, lng: -1.6178 }, zoom: 11 },
    "Sheffield": { center: { lat: 53.3811, lng: -1.4701 }, zoom: 11 },
    "Nottingham": { center: { lat: 52.9548, lng: -1.1581 }, zoom: 11 },
    "Southampton": { center: { lat: 50.9097, lng: -1.4044 }, zoom: 11 },
    "Portsmouth": { center: { lat: 50.8198, lng: -1.0880 }, zoom: 11 },
    "Plymouth": { center: { lat: 50.3755, lng: -4.1427 }, zoom: 11 },
    "Aberdeen": { center: { lat: 57.1497, lng: -2.0943 }, zoom: 11 },
    "Dundee": { center: { lat: 56.4620, lng: -2.9707 }, zoom: 11 },
    "Swansea": { center: { lat: 51.6214, lng: -3.9436 }, zoom: 11 },
};

// US Cities Coordinates (Major metros)
export const US_CITY_VIEWS: Record<string, ViewState> = {
    "New York": { center: { lat: 40.7128, lng: -74.0060 }, zoom: 10 },
    "Los Angeles": { center: { lat: 34.0522, lng: -118.2437 }, zoom: 10 },
    "Chicago": { center: { lat: 41.8781, lng: -87.6298 }, zoom: 10 },
    "Houston": { center: { lat: 29.7604, lng: -95.3698 }, zoom: 10 },
    "Phoenix": { center: { lat: 33.4484, lng: -112.0740 }, zoom: 10 },
    "Philadelphia": { center: { lat: 39.9526, lng: -75.1652 }, zoom: 10 },
    "San Antonio": { center: { lat: 29.4241, lng: -98.4936 }, zoom: 10 },
    "San Diego": { center: { lat: 32.7157, lng: -117.1611 }, zoom: 10 },
    "Dallas": { center: { lat: 32.7767, lng: -96.7970 }, zoom: 10 },
    "San Jose": { center: { lat: 37.3382, lng: -121.8863 }, zoom: 10 },
    "Austin": { center: { lat: 30.2672, lng: -97.7431 }, zoom: 10 },
    "Jacksonville": { center: { lat: 30.3322, lng: -81.6557 }, zoom: 10 },
    "Fort Worth": { center: { lat: 32.7555, lng: -97.3308 }, zoom: 10 },
    "Columbus": { center: { lat: 39.9612, lng: -82.9988 }, zoom: 10 },
    "San Francisco": { center: { lat: 37.7749, lng: -122.4194 }, zoom: 10 },
    "Charlotte": { center: { lat: 35.2271, lng: -80.8431 }, zoom: 10 },
    "Indianapolis": { center: { lat: 39.7684, lng: -86.1581 }, zoom: 11 },
    "Seattle": { center: { lat: 47.6062, lng: -122.3321 }, zoom: 11 },
    "Denver": { center: { lat: 39.7392, lng: -104.9903 }, zoom: 11 },
    "Washington": { center: { lat: 38.9072, lng: -77.0369 }, zoom: 11 },
    "Boston": { center: { lat: 42.3601, lng: -71.0589 }, zoom: 11 },
    "El Paso": { center: { lat: 31.7619, lng: -106.4850 }, zoom: 11 },
    "Nashville": { center: { lat: 36.1627, lng: -86.7816 }, zoom: 11 },
    "Las Vegas": { center: { lat: 36.1716, lng: -115.1391 }, zoom: 11 },
};

export function getViewState(city: string, countryCode: string = 'US'): ViewState {
    // Normalization
    const normalizedCity = city.trim();

    // UK Logic
    if (countryCode === 'GB' || countryCode === 'UK') {
        const cityView = Object.entries(UK_CITY_VIEWS).find(([key]) => key.toLowerCase() === normalizedCity.toLowerCase());
        if (cityView) return cityView[1];

        // If specific city not found but we are in GB mode, return general UK view
        // Ideally we would geocode, but for now fallback to Center of UK
        return { center: UK_CENTER, zoom: UK_DEFAULT_ZOOM };
    }

    // US Logic
    const usCityView = Object.entries(US_CITY_VIEWS).find(([key]) => key.toLowerCase() === normalizedCity.toLowerCase());
    if (usCityView) return usCityView[1];

    // Resolve State
    const state = getStateForCity(normalizedCity);

    if (state && STATE_VIEWS[state]) {
        return STATE_VIEWS[state];
    }

    // Default to US View
    return { center: US_CENTER, zoom: US_DEFAULT_ZOOM };
}
