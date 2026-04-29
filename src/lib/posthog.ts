import { devLog } from "@/lib/devLog";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || import.meta.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;
let posthogClient: any = null;
let posthogLoadPromise: Promise<any> | null = null;

const onIdle = (callback: () => void) => {
    if (typeof window === 'undefined') return;
    const requestIdle = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout: number }) => number);
    if (requestIdle) {
        requestIdle(callback, { timeout: 3500 });
        return;
    }
    window.setTimeout(callback, 1800);
};

const loadPostHog = async () => {
    if (posthogClient) return posthogClient;
    if (!posthogLoadPromise) {
        posthogLoadPromise = import('posthog-js').then((module) => module.default || module);
    }
    posthogClient = await posthogLoadPromise;
    return posthogClient;
};

const initializePostHogNow = async () => {
    if (isInitialized || !POSTHOG_KEY) return posthogClient;
    const posthog = await loadPostHog();
    posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        capture_pageview: false,
        loaded: (ph: any) => {
            if (import.meta.env.DEV) ph.debug(false);
        }
    });
    isInitialized = true;
    devLog("PostHog Analytics initialized successfully.");
    return posthog;
};

export const initPostHog = () => {
    if (typeof window === 'undefined' || isInitialized || !POSTHOG_KEY) {
        if (import.meta.env.DEV && !POSTHOG_KEY) {
            console.warn("PostHog Analytics: Missing 'VITE_POSTHOG_KEY' in .env. Tracking is disabled.");
        }
        return;
    }

    onIdle(async () => {
        if (isInitialized) return;
        try {
            await initializePostHogNow();
        } catch (error) {
            if (import.meta.env.DEV) console.error("PostHog Analytics failed to initialize", error);
        }
    });
};

const withPostHog = (callback: (posthog: any) => void) => {
    if (!POSTHOG_KEY || typeof window === 'undefined') return;
    onIdle(async () => {
        try {
            const posthog = await initializePostHogNow();
            callback(posthog);
        } catch (error) {
            if (import.meta.env.DEV) console.warn("PostHog tracking skipped", error);
        }
    });
};

export const trackPostHogPageView = (url: string) => {
    if (isInitialized && posthogClient) {
        posthogClient.capture('$pageview', { $current_url: url });
        return;
    }
    withPostHog((posthog) => posthog.capture('$pageview', { $current_url: url }));
};

export const trackPostHogEvent = (eventName: string, properties?: Record<string, any>) => {
    if (isInitialized && posthogClient) {
        posthogClient.capture(eventName, properties);
        return;
    }
    withPostHog((posthog) => posthog.capture(eventName, properties));
};
