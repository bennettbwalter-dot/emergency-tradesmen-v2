import { devLog } from "@/lib/devLog";
import { trackPostHogEvent } from "@/lib/posthog";

declare function gtag(...args: unknown[]): void;

const ga = (...args: unknown[]) => {
    if (typeof gtag !== 'undefined') gtag(...args);
};

export const initGA = () => {
    if (import.meta.env.DEV) devLog('[Analytics] GA4 + PostHog active');
};

export const trackPageView = (path: string) => {
    ga('event', 'page_view', { page_path: path });
    if (import.meta.env.DEV) devLog(`[Analytics] Page View: ${path}`);
};

export const trackEvent = (category: string, action: string, label?: string) => {
    ga('event', action, { event_category: category, event_label: label ?? '' });
    trackPostHogEvent(action, { category, label: label ?? '', timestamp: new Date().toISOString() });
    if (import.meta.env.DEV) devLog(`[Analytics] Event: ${category} - ${action}${label ? ` (${label})` : ''}`);
};

export const trackConversion = (value: number, currency: string, transactionId?: string) => {
    ga('event', 'purchase', {
        transaction_id: transactionId ?? `txn_${Date.now()}`,
        value,
        currency,
        items: [{ item_name: 'Pro Subscription', quantity: 1, price: value }]
    });
    trackPostHogEvent('subscription_purchased', { value, currency, transaction_id: transactionId });
};
