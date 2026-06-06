import type { AlertFeedConfig } from "./types";

export const US_ALERT_FEEDS: AlertFeedConfig[] = [
  {
    id: "us-nws-active-alerts",
    country: "US",
    kind: "json",
    category: "weather",
    sourceName: "National Weather Service",
    sourceUrl: "https://www.weather.gov/alerts",
    apiUrl: "https://api.weather.gov/alerts/active",
    cacheTtlMs: 5 * 60 * 1000,
    national: true,
  },
  {
    id: "us-fema-disasters",
    country: "US",
    kind: "json",
    category: "local",
    sourceName: "FEMA",
    sourceUrl: "https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2",
    apiUrl: "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries",
    cacheTtlMs: 60 * 60 * 1000,
    national: true,
  },
  {
    id: "us-cpsc-recalls",
    country: "US",
    kind: "json",
    category: "recall",
    sourceName: "CPSC",
    sourceUrl: "https://www.cpsc.gov/Recalls",
    apiUrl: "https://www.saferproducts.gov/RestWebServices/Recall?format=json",
    cacheTtlMs: 60 * 60 * 1000,
    national: true,
  },
];

