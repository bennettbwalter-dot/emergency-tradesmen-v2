
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getViewState } from '@/lib/mapUtils';
import { useAuth } from "@/contexts/AuthContext";

// Fix Leaflet generic marker icon missing assets
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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
}

export function InteractiveMap({ city, className = "w-full h-full min-h-[300px]", showBusinesses = false, businesses = [], countryCode: propCountryCode }: InteractiveMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // Determine Country Code from prop or implicit URL
    const isUrlUS = window.location.pathname.startsWith('/us') || window.location.pathname.includes('/us/');
    const effectiveCountryCode = propCountryCode || (isUrlUS ? 'US' : 'GB');
    const countryCode = effectiveCountryCode;

    // Get View State
    const { center, zoom } = getViewState(city, countryCode);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        // If map already initialized, just return (view update handled in separate effect)
        if (mapInstanceRef.current) return;

        console.log("Initializing Leaflet Map...");
        const map = L.map(mapContainerRef.current).setView([center.lat, center.lng], zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        mapInstanceRef.current = map;

        // Cleanup
        return () => {
            // In strict mode, this might cleanup too early if we aren't careful, 
            // but usually we want to destroy on unmount.
            // However, for hot reload, we should check.
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []); // Run once on mount

    // Update View
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        const map = mapInstanceRef.current;

        map.setView([center.lat, center.lng], zoom);
    }, [center.lat, center.lng, zoom]); // Update when target changes

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
