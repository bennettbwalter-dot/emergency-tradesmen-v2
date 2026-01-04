import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { isCaliforniaCity, trackCaliforniaPageView } from "@/lib/california_analytics";

export const AnalyticsTracker = () => {
    const location = useLocation();
    const params = useParams<{ city?: string; tradePath?: string }>();

    useEffect(() => {
        // Standard page view tracking
        trackPageView(location.pathname + location.search);

        // California-specific tracking
        if (params.city && isCaliforniaCity(params.city)) {
            const trade = params.tradePath?.replace('emergency-', '') || 'general';
            trackCaliforniaPageView(params.city, trade, location.pathname);
        }
    }, [location, params]);

    return null;
};
