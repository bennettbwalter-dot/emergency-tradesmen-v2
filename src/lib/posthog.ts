import posthog from 'posthog-js';

export { posthog };

// Get keys securely from either Vite or Next.js conventions
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || import.meta.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;

export const initPostHog = () => {
    if (typeof window === 'undefined' || isInitialized) return;

    if (!POSTHOG_KEY) {
        console.warn("PostHog Analytics: Missing 'VITE_POSTHOG_KEY' in .env. Tracking is disabled.");
        return;
    }

    try {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            // In SPAs, PostHog tries to auto-track. We disable it here to gain perfect control in AnalyticsTracker
            capture_pageview: false,
            loaded: (ph) => {
                if (import.meta.env.DEV) {
                    // Disable debug logs by default to keep console clean, but leave hook for activation
                    ph.debug(false);
                }
            }
        });
        isInitialized = true;
        console.log("PostHog Analytics initialized successfully.");
    } catch (e) {
        console.error("PostHog Analytics failed to initialize", e);
    }
};

export const trackPostHogPageView = (url: string) => {
    if (isInitialized) {
        posthog.capture('$pageview', {
            $current_url: url,
        });
    }
};

export const trackPostHogEvent = (eventName: string, properties?: Record<string, any>) => {
    if (isInitialized) {
        posthog.capture(eventName, properties);
    }
};
