import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { trackPageView } from "@/lib/analytics";
import { isCaliforniaCity, trackCaliforniaPageView } from "@/lib/california_analytics";
import { trackPostHogPageView } from "@/lib/posthog";

export const AnalyticsTracker = () => {
    const location = useLocation();
    const params = useParams<{ city?: string; tradePath?: string }>();

    useEffect(() => {
        const fullUrl = location.pathname + location.search;
        // Standard page view tracking (Google Analytics etc)
        trackPageView(fullUrl);

        // PostHog accurate page view tracking
        trackPostHogPageView(fullUrl);

        // California-specific tracking
        if (params.city && isCaliforniaCity(params.city)) {
            const trade = params.tradePath?.replace('emergency-', '') || 'general';
            trackCaliforniaPageView(params.city, trade, location.pathname);
        }
    }, [location, params]);

    return null;
};
