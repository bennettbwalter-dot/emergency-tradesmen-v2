// Analytics - PostHog (Free, No Payment Required)
import { devLog } from "@/lib/devLog";
import { trackPostHogEvent } from "@/lib/posthog";

export const initGA = () => {
    // PostHog is initialized in main.tsx / App.tsx via PostHogProvider
    if (import.meta.env.DEV) {
        devLog(`[Analytics] Initialized (PostHog)`);
    }
};

export const trackPageView = (path: string) => {
    if (import.meta.env.DEV) {
        devLog(`[Analytics] Page View: ${path}`);
    }
};

export const trackEvent = (category: string, action: string, label?: string) => {
    // Track via PostHog for free conversion analytics
    trackPostHogEvent(action, {
        category,
        label: label || '',
        timestamp: new Date().toISOString()
    });

    if (import.meta.env.DEV) {
        devLog(`[Analytics] Event: ${category} - ${action} ${label ? `(${label})` : ""}`);
    }
};

