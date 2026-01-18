import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface LeafletMapProps {
    city: string;
    businessName?: string;
    address?: string;
    className?: string;
}

export function LeafletMap({ city, businessName, className = "w-full h-full min-h-[300px]" }: LeafletMapProps) {
    const [coords, setCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        // Simple internal geocoding based on common UK/US cities or fallback
        // In a real scenario without Google, we might use a dedicated OSM geocoder or our internal JSON
        // For now, we'll try to find the city in our internal data or default to London/NY

        // This is a placeholder logic. Real implementation would look up `city` in `us_cities.json` or `uk-city-grouping`
        // Since we don't have lat/lon in the grouped arrays easily accessible without loading huge files,
        // we will default to a neutral view or try to fetch from a free OSM nomination service if permitted (but goal is 0 external dependencies if possible).
        // FOR NOW: Let's default to a safe center and rely on future expansion or specific City coords if passed.

        // If we strictly want NO external calls, we need coordinates. 
        // Let's default to London as base for UK and Dallas for US if "Dallas" is in name

        if (city.toLowerCase() === 'london') {
            setCoords([51.505, -0.09]);
        } else if (city.toLowerCase().includes('dallas')) {
            setCoords([32.7767, -96.7970]);
        } else {
            // Default generic view (Atlantic middle) or maybe London as it's UK centric app initially?
            // Let's default to London for now as fallback
            setCoords([51.505, -0.09]);
        }

        // Ideally we would load the lat/lon from our `us_cities.json` or similar if we had it indexed.
        // Since we are just "Removing Google", replacing with a static map or an OSM tile layer at a default location is the step 1.

    }, [city]);

    if (!coords) return null;

    return (
        <div className={`overflow-hidden rounded-lg bg-secondary/20 border border-border/50 ${className}`}>
            <MapContainer center={coords} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={coords}>
                    <Popup>
                        {businessName || city}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
