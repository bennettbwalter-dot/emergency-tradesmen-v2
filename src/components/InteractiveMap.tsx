import { useState, useCallback, useEffect } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { useAuth } from "@/contexts/AuthContext";
import mapConfig from "@/config/maps.json";

interface InteractiveMapProps {
    city: string;
    className?: string;
    showBusinesses?: boolean;
}

// Fallback coordinates for cities if geocoding fails or isn't used
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    "London": { lat: 51.5074, lng: -0.1278 },
    "Manchester": { lat: 53.4808, lng: -2.2426 },
    "Birmingham": { lat: 52.4862, lng: -1.8904 },
    "Leeds": { lat: 53.8008, lng: -1.5491 },
    "Liverpool": { lat: 53.4084, lng: -2.9916 },
    "Glasgow": { lat: 55.8642, lng: -4.2518 },
    "Edinburgh": { lat: 55.9533, lng: -3.1883 },
    "Bristol": { lat: 51.4545, lng: -2.5879 },
    "Cardiff": { lat: 51.4816, lng: -3.1791 },
    "Nottingham": { lat: 52.9548, lng: -1.1581 },
    "Sheffield": { lat: 53.3811, lng: -1.4701 },
    "Leicester": { lat: 52.6369, lng: -1.1398 }
};

export function InteractiveMap({ city, className = "w-full h-full min-h-[300px]", showBusinesses = false }: InteractiveMapProps) {
    const { user } = useAuth();
    const [center, setCenter] = useState(CITY_COORDINATES["London"]);
    const [zoom, setZoom] = useState(11);

    // Effect to update map center when city changes
    useEffect(() => {
        // Simple normalization
        const normalizedCity = Object.keys(CITY_COORDINATES).find(
            c => c.toLowerCase() === city.toLowerCase()
        );

        if (normalizedCity) {
            setCenter(CITY_COORDINATES[normalizedCity]);
            setZoom(12);
        } else {
            // Default fallback if city not found in our hardcoded list
            // Ideally we would use the Geocoding API service here
            console.warn(`City coordinates not found for ${city}`);
        }
    }, [city]);


    return (
        <div className={`overflow-hidden rounded-lg bg-secondary/20 border border-border/50 ${className}`}>
            <Map
                mapId="DEMO_MAP_ID" // Required for AdvancedMarker
                defaultCenter={center}
                center={center}
                defaultZoom={11}
                zoom={zoom}
                onCameraChanged={(ev) => {
                    setCenter(ev.detail.center);
                    setZoom(ev.detail.zoom);
                }}
                gestureHandling={'cooperative'}
                disableDefaultUI={false}
                className="w-full h-full"
            >
                <AdvancedMarker position={center}>
                    <Pin background={'#D4AF37'} glyphColor={'#000'} borderColor={'#000'} />
                </AdvancedMarker>
            </Map>
        </div>
    );
}
