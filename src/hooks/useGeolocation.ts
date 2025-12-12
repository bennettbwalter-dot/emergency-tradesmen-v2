import { useState } from "react";
import { findNearestCity } from "@/lib/cityCoordinates";

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

    const getLocation = () => {
        if (!navigator.geolocation) {
            setState((prev) => ({ ...prev, error: "Geolocation is not supported by your browser" }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Find nearest city using distance calculation (no API key required)
                const nearestCity = findNearestCity(latitude, longitude);

                console.log(`Nearest city: ${nearestCity.city} (${nearestCity.distance.toFixed(1)}km away)`);

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
            }
        );
    };

    return { ...state, getLocation };
}
