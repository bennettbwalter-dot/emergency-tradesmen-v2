import type { AlertCategory, AlertCountry, AlertSeverity } from "../../config/alerts/types";

export type { AlertCategory, AlertCountry, AlertSeverity };

export interface LiveAlert {
  id: string;
  title: string;
  category: AlertCategory;
  categoryLabel: string;
  summary: string;
  location: string;
  sourceName: string;
  sourceUrl?: string;
  updatedAt: string;
  severity: AlertSeverity;
  country: AlertCountry;
}

export interface LiveAlertsResponse {
  alerts: LiveAlert[];
  generatedAt: string;
  country: AlertCountry;
  locationLabel: string;
  partialFailure: boolean;
  failedSources: string[];
}
