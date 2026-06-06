import type { AlertFeedConfig } from "./types";

export const UK_ALERT_FEEDS: AlertFeedConfig[] = [
  {
    id: "uk-met-office-warnings",
    country: "GB",
    kind: "rss",
    category: "weather",
    sourceName: "Met Office",
    sourceUrl: "https://www.metoffice.gov.uk/weather/warnings-and-advice/uk-warnings",
    apiUrl: "https://weather.metoffice.gov.uk/public/data/PWSCache/WarningsRSS/Region/UK",
    cacheTtlMs: 10 * 60 * 1000,
    national: true,
  },
  {
    id: "uk-environment-agency-floods",
    country: "GB",
    kind: "json",
    category: "flood",
    sourceName: "Environment Agency",
    sourceUrl: "https://check-for-flooding.service.gov.uk/",
    apiUrl: "https://environment.data.gov.uk/flood-monitoring/id/floods?min-severity=3",
    cacheTtlMs: 10 * 60 * 1000,
    national: true,
  },
  {
    id: "uk-national-highways-incidents",
    country: "GB",
    kind: "rss",
    category: "traffic",
    sourceName: "National Highways",
    sourceUrl: "https://nationalhighways.co.uk/travel-updates/traffic-information-rss-feeds/",
    apiUrl: "https://m.highwaysengland.co.uk/feeds/rss/UnplannedEvents.xml",
    cacheTtlMs: 3 * 60 * 1000,
    national: true,
  },
  {
    id: "uk-gov-product-safety",
    country: "GB",
    kind: "atom",
    category: "recall",
    sourceName: "GOV.UK Product Safety",
    sourceUrl: "https://www.gov.uk/product-safety-alerts-reports-recalls",
    apiUrl: "https://www.gov.uk/product-safety-alerts-reports-recalls.atom",
    cacheTtlMs: 30 * 60 * 1000,
    national: true,
  },
];

