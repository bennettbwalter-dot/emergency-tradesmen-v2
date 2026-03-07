
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getViewState } from '@/lib/mapUtils';
import { useAuth } from "@/contexts/AuthContext";

// Fix Leaflet generic marker icon missing assets
import icon from 'leaflet/dist/images/marker-icon.webp';
import iconShadow from 'leaflet/dist/images/marker-shadow.webp';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
    city: string;
    className?: string;
    showBusinesses?: boolean;
    businesses?: any[];
    countryCode?: string;
    latitude?: string | number;
    longitude?: string | number;
}

export function InteractiveMap({ city, className = "w-full h-full min-h-[300px]", showBusinesses = false, businesses = [], countryCode: propCountryCode, latitude, longitude }: InteractiveMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Determine Country Code from prop or implicit URL
    const isUrlUS = window.location.pathname.startsWith('/us') || window.location.pathname.includes('/us/');
    const effectiveCountryCode = propCountryCode || (isUrlUS ? 'US' : 'GB');
    const countryCode = effectiveCountryCode;

    // Get initial View State from static list
    const initialViewState = getViewState(city, countryCode);
    const [viewState, setViewState] = useState(initialViewState);

    // Effect to update view state when props change or via Geocoding
    useEffect(() => {
        // 1. If explicit coordinates are provided, use them immediately
        if (latitude && longitude) {
            setViewState({
                center: { lat: parseFloat(latitude as string), lng: parseFloat(longitude as string) },
                zoom: 15 // High zoom for specific business
            });
            return;
        }

        // 2. Try static local lookup first (fastest)
        const staticView = getViewState(city, countryCode);

        // Check if static lookup returned a generic country center
        const isGenericUK = staticView.center.lat === 54.5 && staticView.center.lng === -4.0;
        const isGenericUS = staticView.center.lat === 39.8283 && staticView.center.lng === -98.5795;

        // If we found a specific city in our static list, use it immediately
        if (!isGenericUK && !isGenericUS) {
            setViewState(staticView);
            return;
        }

        // 3. If generic, try detailed Geocoding via Nominatim
        console.log(`Map: Static lookup failed for ${city}, trying Nominatim...`);
        const fetchCoordinates = async () => {
            try {
                const query = `${city}, ${countryCode === 'US' ? 'USA' : 'UK'}`;
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    console.log(`Map: Found coords for ${city}:`, { lat, lon });
                    setViewState({
                        center: { lat, lng: lon },
                        zoom: 12
                    });
                } else {
                    console.warn(`Map: No results for ${city}, staying at default.`);
                    setViewState(staticView); // Fallback to country view
                }
            } catch (err) {
                console.error("Map: Geocoding error", err);
                setViewState(staticView);
            }
        };

        fetchCoordinates();
    }, [city, countryCode, latitude, longitude]);

    // Initialize Map Instance and update its view when viewState changes
    useEffect(() => {
        if (!mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
            // Initialize map only once
            const map = L.map(mapContainerRef.current).setView([viewState.center.lat, viewState.center.lng], viewState.zoom);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.webp', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            mapInstanceRef.current = map;
        } else {
            // Update view if map already exists
            mapInstanceRef.current.setView([viewState.center.lat, viewState.center.lng], viewState.zoom);
        }

        // Cleanup function for when the component unmounts
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [viewState]); // Depend on viewState to initialize and update map

    // Update Markers
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        if (showBusinesses && businesses) {
            businesses.forEach(biz => {
                if (biz.latitude && biz.longitude) {
                    const marker = L.marker([parseFloat(biz.latitude), parseFloat(biz.longitude)])
                        .addTo(map)
                        .bindPopup(`
                            <div class="font-sans">
                                <b>${biz.name}</b><br/>
                                <span class="text-xs">${biz.address || ''}</span>
                            </div>
                        `);
                    markersRef.current.push(marker);
                }
            });
        }
    }, [showBusinesses, businesses]); // Re-run when business list changes

    useEffect(() => {
        import('@/lib/usage-logger').then(({ usageLogger }) => {
            usageLogger.incrementUsage('leaflet_map_loads', 1);
        });
    }, []);

    return (
        <div className={`overflow-hidden rounded-lg bg-secondary/20 border border-border/50 ${className}`}>
            <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: '100%', minWidth: '100%' }} />
        </div>
    );
}
