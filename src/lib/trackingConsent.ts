export const ANALYTICS_CONSENT_KEY = "cookieConsent";

export interface AnalyticsConsentStorage {
  getItem(key: string): string | null;
}

export interface AnalyticsConsentWriter {
  setItem(key: string, value: string): void;
}

export function hasAnalyticsConsent(storage: AnalyticsConsentStorage | null | undefined) {
  return storage?.getItem(ANALYTICS_CONSENT_KEY) === "accepted";
}

export function acceptAnalyticsConsent(
  storage: AnalyticsConsentWriter,
  onAccepted: () => void,
) {
  storage.setItem(ANALYTICS_CONSENT_KEY, "accepted");
  onAccepted();
}
