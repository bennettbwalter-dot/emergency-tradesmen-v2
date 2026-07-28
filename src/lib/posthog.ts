import { devLog } from "@/lib/devLog";
import { hasAnalyticsConsent } from "@/lib/trackingConsent";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || import.meta.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || import.meta.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isInitialized = false;
let posthogClient: any = null;
let posthogLoadPromise: Promise<any> | null = null;
let posthogInitPromise: Promise<any> | null = null;

type FeatureFlagSubscriber = {
    connect: () => Promise<void>;
};

const featureFlagSubscribers = new Set<FeatureFlagSubscriber>();

const analyticsConsentGranted = () =>
    typeof window !== "undefined" && hasAnalyticsConsent(window.localStorage);

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
        const loadAttempt = import('posthog-js').then((module) => module.default || module);
        posthogLoadPromise = loadAttempt;
        loadAttempt.catch(() => {
            if (posthogLoadPromise === loadAttempt) posthogLoadPromise = null;
        });
    }
    posthogClient = await posthogLoadPromise;
    return posthogClient;
};

const initializePostHogNow = async () => {
    if (isInitialized || !POSTHOG_KEY || !analyticsConsentGranted()) return posthogClient;
    if (!posthogInitPromise) {
        const initAttempt = (async () => {
            const posthog = await loadPostHog();
            if (!analyticsConsentGranted()) return null;
            if (!isInitialized && analyticsConsentGranted()) {
                posthog.init(POSTHOG_KEY, {
                    api_host: POSTHOG_HOST,
                    capture_pageview: false,
                    loaded: (ph: any) => {
                        if (import.meta.env.DEV) ph.debug(false);
                    }
                });
                isInitialized = true;
                devLog("PostHog Analytics initialized successfully.");
            }
            return posthog;
        })();
        posthogInitPromise = initAttempt;
        initAttempt.then(
            (posthog) => {
                if (!posthog && posthogInitPromise === initAttempt) {
                    posthogInitPromise = null;
                }
            },
            () => {
                if (posthogInitPromise === initAttempt) {
                    posthogInitPromise = null;
                }
            },
        );
    }
    return posthogInitPromise;
};

const activateFeatureFlagSubscribers = () => {
    if (!analyticsConsentGranted()) return;
    featureFlagSubscribers.forEach((subscriber) => {
        void subscriber.connect();
    });
};

export const initPostHog = () => {
    if (
        typeof window === 'undefined'
        || isInitialized
        || !POSTHOG_KEY
        || !analyticsConsentGranted()
    ) {
        if (import.meta.env.DEV && !POSTHOG_KEY) {
            console.warn("PostHog Analytics: Missing 'VITE_POSTHOG_KEY' in .env. Tracking is disabled.");
        }
        return;
    }

    activateFeatureFlagSubscribers();
    onIdle(async () => {
        if (isInitialized || !analyticsConsentGranted()) return;
        try {
            await initializePostHogNow();
        } catch (error) {
            if (import.meta.env.DEV) console.error("PostHog Analytics failed to initialize", error);
        }
    });
};

const withPostHog = (callback: (posthog: any) => void) => {
    if (!POSTHOG_KEY || typeof window === 'undefined' || !analyticsConsentGranted()) return;
    onIdle(async () => {
        try {
            const posthog = await initializePostHogNow();
            if (!posthog || !analyticsConsentGranted()) return;
            callback(posthog);
        } catch (error) {
            if (import.meta.env.DEV) console.warn("PostHog tracking skipped", error);
        }
    });
};

export const getPostHogFeatureFlag = async (flagKey: string): Promise<boolean> => {
    if (!POSTHOG_KEY || typeof window === 'undefined' || !analyticsConsentGranted()) {
        return false;
    }

    try {
        const posthog = await initializePostHogNow();
        if (!posthog || !analyticsConsentGranted()) return false;
        return posthog.isFeatureEnabled(flagKey) === true;
    } catch (error) {
        if (import.meta.env.DEV) {
            console.warn("PostHog feature flag read skipped", error);
        }
        return false;
    }
};

export const subscribePostHogFeatureFlag = (
    flagKey: string,
    onChange: (enabled: boolean) => void,
) => {
    let isActive = true;
    let isConnected = false;
    let connectPromise: Promise<void> | null = null;
    let unsubscribeFromVendor: (() => void) | undefined;

    const connect = () => {
        if (!isActive || isConnected || !analyticsConsentGranted()) {
            return Promise.resolve();
        }
        if (connectPromise) return connectPromise;

        connectPromise = (async () => {
            const posthog = await initializePostHogNow();
            if (!isActive || !posthog || !analyticsConsentGranted()) return;

            const readFlag = () => {
                if (!isActive) return;
                if (!analyticsConsentGranted()) {
                    onChange(false);
                    return;
                }
                onChange(posthog.isFeatureEnabled(flagKey) === true);
            };

            unsubscribeFromVendor = posthog.onFeatureFlags(readFlag);
            isConnected = true;
            readFlag();
        })()
            .catch((error) => {
                if (import.meta.env.DEV) {
                    console.warn("PostHog feature flag subscription skipped", error);
                }
            })
            .finally(() => {
                connectPromise = null;
            });

        return connectPromise;
    };

    const subscriber = { connect };
    featureFlagSubscribers.add(subscriber);
    onChange(false);
    void connect();

    return () => {
        isActive = false;
        featureFlagSubscribers.delete(subscriber);
        unsubscribeFromVendor?.();
    };
};

export const trackPostHogPageView = (url: string) => {
    if (!analyticsConsentGranted()) return;
    if (isInitialized && posthogClient) {
        posthogClient.capture('$pageview', { $current_url: url });
        return;
    }
    withPostHog((posthog) => posthog.capture('$pageview', { $current_url: url }));
};

export const trackPostHogEvent = (eventName: string, properties?: Record<string, any>) => {
    if (!analyticsConsentGranted()) return;
    if (isInitialized && posthogClient) {
        posthogClient.capture(eventName, properties);
        return;
    }
    withPostHog((posthog) => posthog.capture(eventName, properties));
};
