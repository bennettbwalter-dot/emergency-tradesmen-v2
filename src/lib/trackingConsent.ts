export const ANALYTICS_CONSENT_KEY = "cookieConsent";

export interface AnalyticsConsentStorage {
  getItem(key: string): string | null;
}

export function hasAnalyticsConsent(storage: AnalyticsConsentStorage | null | undefined) {
  return storage?.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
}
