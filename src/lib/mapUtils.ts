
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
    // Resolve State
    const state = getStateForCity(normalizedCity);

    if (state && STATE_VIEWS[state]) {
        return STATE_VIEWS[state];
    }

    // Default to US View
    return { center: US_CENTER, zoom: US_DEFAULT_ZOOM };
}
