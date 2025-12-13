import { useAuth } from "@/contexts/AuthContext";
import mapConfig from "@/config/maps.json";

interface IframeMapProps {
    city: string;
    businessName?: string;
    address?: string;
    className?: string;
}

export function IframeMap({ city, businessName, address, className = "w-full h-full min-h-[300px]" }: IframeMapProps) {
    const { user } = useAuth();

    // 1. Check for user-specific map config if user is logged in
    const userMapUrl = user ? (mapConfig.users as Record<string, string>)[user.id] : undefined;

    // 2. Check for city-specific map config
    const cityMapUrl = (mapConfig.cities as Record<string, string>)[city];

    // 3. Fallback to dynamic search embed
    // If business details are present, search for the specific business to show its Google listing (and reviews)
    let query = city + " UK";
    if (businessName) {
        // Prefer "Name, Address" > "Name, City" > "City"
        query = address ? `${businessName}, ${address}` : `${businessName}, ${city}, UK`;
    }

    // Note: Using the basic embed format which doesn't require an API key for search queries
    const dynamicUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

    const mapUrl = userMapUrl || cityMapUrl || dynamicUrl;

    return (
        <div className={`overflow-hidden rounded-lg bg-secondary/20 border border-border/50 ${className}`}>
            <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "100%" }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${city}`}
            />
        </div>
    );
}
