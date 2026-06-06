import { useCallback, useState } from "react";
import { devLog } from "@/lib/devLog";
import { findNearestCity } from "@/lib/cityCoordinates";
import { getSiteCountryCode } from "@/lib/siteConfig";

const UK_BOUNDS = { minLat: 49.8, maxLat: 60.9, minLng: -8.8, maxLng: 2.1 };
const US_BOUNDS = { minLat: 24.3, maxLat: 49.5, minLng: -125, maxLng: -66.8 };

interface GeolocationState {
    loading: boolean;
    error: string | null;
    place: {
        city: string;
        postcode: string;
        coordinates: { lat: number; lng: number };
    } | null;
}



export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        loading: false,
        error: null,
        place: null,
    });

    const getLocation = useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: "Your browser does not support location. Type your town, city, postcode, or ZIP code manually.",
            }));
            return;
        }

        if (typeof window !== "undefined" && !window.isSecureContext && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
            setState((prev) => ({
                ...prev,
                error: "Location needs a secure HTTPS connection. Type your town, city, postcode, or ZIP code manually.",
            }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
                    setState({
                        loading: false,
                        error: "Your browser returned an invalid location. Type your town, city, postcode, or ZIP code manually.",
                        place: null,
                    });
                    return;
                }

                // Find nearest city using local indexes only (no API key required)
                const countryCode = getSiteCountryCode();
                if (!coordsWithinCountry(latitude, longitude, countryCode)) {
                    setState({
                        loading: false,
                        error: countryCode === "GB"
                            ? "This site only covers UK locations"
                            : "This site only covers USA locations",
                        place: null,
                    });
                    return;
                }

                const nearestCity = findNearestCity(latitude, longitude, countryCode);
                if (!nearestCity) {
                    setState({
                        loading: false,
                        error: "Unable to identify your nearest area. Type your town, city, postcode, or ZIP code manually.",
                        place: null,
                    });
                    return;
                }

                devLog(`Nearest city: ${nearestCity.city} (${nearestCity.distance.toFixed(1)}km away)`);

                setState({
                    loading: false,
                    error: null,
                    place: {
                        city: nearestCity.city,
                        postcode: "",
                        coordinates: { lat: latitude, lng: longitude },
                    },
                });
            },
            (error) => {
                setState({ loading: false, error: getGeolocationErrorMessage(error), place: null });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
        );
    }, []);

    return { ...state, getLocation };
}

function coordsWithinCountry(lat: number, lng: number, countryCode: "GB" | "US"): boolean {
    const bounds = countryCode === "US" ? US_BOUNDS : UK_BOUNDS;
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "Location access was blocked. Type your town, city, postcode, or ZIP code manually.";
        case error.POSITION_UNAVAILABLE:
            return "Your device could not provide a location. Check location services or type your area manually.";
        case error.TIMEOUT:
            return "Location took too long to load. Try Locate Me again or type your area manually.";
        default:
            return "Unable to find your location right now. Type your town, city, postcode, or ZIP code manually.";
    }
}
