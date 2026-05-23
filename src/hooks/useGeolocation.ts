import { useCallback, useState } from "react";
import { devLog } from "@/lib/devLog";
import { findNearestCity } from "@/lib/cityCoordinates";
import { getSiteCountryCode } from "@/lib/siteConfig";

const UK_BOUNDS = { minLat: 49.8, maxLat: 60.9, minLng: -8.8, maxLng: 2.1 };
const US_BOUNDS = { minLat: 24.3, maxLat: 49.5, minLng: -125, maxLng: -66.8 };
const MAX_ACCEPTED_ACCURACY_METERS = 2500;

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
        if (!navigator.geolocation) {
            setState((prev) => ({ ...prev, error: "Geolocation is not supported by your browser" }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                if (Number.isFinite(accuracy) && accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
                    setState({
                        loading: false,
                        error: "Your phone only provided an approximate network location. Turn on precise location/GPS or choose your area manually.",
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
                let errorMessage = "Unable to retrieve your location";
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = "Location permission denied";
                }
                setState({ loading: false, error: errorMessage, place: null });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, []);

    return { ...state, getLocation };
}

function coordsWithinCountry(lat: number, lng: number, countryCode: "GB" | "US"): boolean {
    const bounds = countryCode === "US" ? US_BOUNDS : UK_BOUNDS;
    return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}
