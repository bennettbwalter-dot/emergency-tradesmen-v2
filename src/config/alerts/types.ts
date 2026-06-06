export type AlertCountry = "GB" | "US";

export type AlertCategory =
  | "weather"
  | "flood"
  | "traffic"
  | "power"
  | "recall"
  | "safety"
  | "local";

export type AlertSeverity = "severe" | "warning" | "watch" | "advisory" | "info";

export type AlertFeedKind = "rss" | "atom" | "json";

export interface AlertFeedConfig {
  id: string;
  country: AlertCountry;
  kind: AlertFeedKind;
  category: AlertCategory;
  sourceName: string;
  sourceUrl: string;
  apiUrl?: string;
  cacheTtlMs: number;
  national: boolean;
}

