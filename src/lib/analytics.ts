// Google Analytics Removed
// This file assumes a no-op implementation or internal logging only.
import { devLog } from "@/lib/devLog";

const MEASUREMENT_ID = ""; // Removed

export const initGA = () => {
    // No-op
    // console.log("Google Analytics is disabled (Privacy/API Removal).");
};

export const trackPageView = (path: string) => {
    // No-op or internal logging
    if (import.meta.env.DEV) {
        devLog(`[Analytics] Page View: ${path}`);
    }
};

export const trackEvent = (category: string, action: string, label?: string) => {
    // No-op or internal logging
    if (import.meta.env.DEV) {
        devLog(`[Analytics] Event: ${category} - ${action} ${label ? `(${label})` : ""}`);
    }
};

