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
    latitude?: string | number;
    longitude?: string | number;
}

export function LeafletMap({ city, businessName, className = "w-full h-full min-h-[300px]", latitude, longitude }: LeafletMapProps) {
    const [coords, setCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        // 1. If explicit coordinates are provided, use them immediately
        if (latitude && longitude) {
            setCoords([parseFloat(latitude as string), parseFloat(longitude as string)]);
            return;
        }

        // 2. Otherwise, check static lookup first
        // We need to determine country code, we'll try to guess from URL or default to GB
        const isUS = window.location.pathname.startsWith('/us') || window.location.pathname.includes('/us/');
        const countryCode = isUS ? 'US' : 'GB';

        import('@/lib/mapUtils').then(({ getViewState }) => {
            const staticView = getViewState(city, countryCode);

            // Check if generic fallback
            const isGenericUK = staticView.center.lat === 54.5 && staticView.center.lng === -4.0;
            const isGenericUS = staticView.center.lat === 39.8283 && staticView.center.lng === -98.5795;

            if (!isGenericUK && !isGenericUS) {
                setCoords([staticView.center.lat, staticView.center.lng]);
                return;
            }

            // 3. Try Nominatim for unknown cities
            const query = `${city}, ${isUS ? 'USA' : 'UK'}`;
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    } else {
                        setCoords([staticView.center.lat, staticView.center.lng]);
                    }
                })
                .catch(() => setCoords([staticView.center.lat, staticView.center.lng]));
        });
    }, [city, latitude, longitude]);

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
