import { UK_ALERT_FEEDS } from "../../config/alerts/ukFeeds";
import { US_ALERT_FEEDS } from "../../config/alerts/usFeeds";
import type { AlertCountry, AlertFeedConfig } from "../../config/alerts/types";
import type { LiveAlert, LiveAlertsResponse } from "./types";
import { fetchXmlFeed, cleanupText } from "./fetchRssFeeds";
import { containsLocation, inferCategory, inferSeverity, makeAlert, severityScore, summarize } from "./parseAlerts";

type AlertRequestContext = {
  country: AlertCountry;
  city?: string | null;
  state?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type CacheEntry = {
  expiresAt: number;
  payload: LiveAlertsResponse;
};

const responseCache = new Map<string, CacheEntry>();
const REQUEST_TIMEOUT_MS = 6500;

export async function handleLiveAlertsRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const country = url.searchParams.get("country") === "US" ? "US" : "GB";
  const lat = parseFinite(url.searchParams.get("lat"));
  const lng = parseFinite(url.searchParams.get("lng"));
  const city = cleanParam(url.searchParams.get("city"));
  const state = cleanParam(url.searchParams.get("state"));

  try {
    const payload = await getLiveAlerts({ country, city, state, lat, lng });
    return json(payload, 200, {
      "Cache-Control": "public, max-age=120, stale-while-revalidate=300",
    });
  } catch (error) {
    console.warn("[live-alerts] request failed", error);
    return json(
      {
        alerts: [],
        generatedAt: new Date().toISOString(),
        country,
        locationLabel: city || state || (country === "US" ? "United States" : "United Kingdom"),
        partialFailure: true,
        failedSources: ["Live alerts"],
      },
      200
    );
  }
}

export async function getLiveAlerts(context: AlertRequestContext): Promise<LiveAlertsResponse> {
  const cacheKey = makeCacheKey(context);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.payload;

  const feeds = context.country === "US" ? US_ALERT_FEEDS : UK_ALERT_FEEDS;
  const settled = await Promise.allSettled(feeds.map((feed) => loadFeedAlerts(feed, context)));
  const failedSources: string[] = [];
  const alerts: LiveAlert[] = [];

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      alerts.push(...result.value);
    } else {
      failedSources.push(feeds[index].sourceName);
      console.warn(`[live-alerts] ${feeds[index].sourceName} failed`, result.reason);
    }
  });

  const locationLabel = context.city || context.state || (context.country === "US" ? "United States" : "United Kingdom");
  const filtered = rankAndLimit(alerts, context);
  const payload: LiveAlertsResponse = {
    alerts: filtered,
    generatedAt: new Date().toISOString(),
    country: context.country,
    locationLabel,
    partialFailure: failedSources.length > 0,
    failedSources,
  };

  responseCache.set(cacheKey, {
    expiresAt: Date.now() + shortestTtl(feeds),
    payload,
  });

  return payload;
}

async function loadFeedAlerts(feed: AlertFeedConfig, context: AlertRequestContext): Promise<LiveAlert[]> {
  if (!feed.apiUrl) return [];

  if (feed.id === "us-nws-active-alerts") return loadNwsAlerts(feed, context);
  if (feed.id === "us-fema-disasters") return loadFemaAlerts(feed, context);
  if (feed.id === "us-cpsc-recalls") return loadCpscRecalls(feed, context);
  if (feed.id === "uk-environment-agency-floods") return loadEnvironmentAgencyFloods(feed, context);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const items = await fetchXmlFeed(feed.apiUrl, controller.signal);
    const limit = feed.category === "recall" ? 3 : 8;
    return items.slice(0, limit).map((item) =>
      makeAlert({
        id: item.id || item.link || item.title,
        title: item.title,
        category: feed.category,
        summary: item.summary || item.title,
        location: feed.national ? "National" : context.city || context.state || "Local area",
        sourceName: feed.sourceName,
        sourceUrl: item.link || feed.sourceUrl,
        updatedAt: item.updatedAt,
        severity: inferSeverity("", item.title, item.summary),
        country: feed.country,
      })
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function loadNwsAlerts(feed: AlertFeedConfig, context: AlertRequestContext): Promise<LiveAlert[]> {
  const url = new URL(feed.apiUrl!);
  if (isFiniteNumber(context.lat) && isFiniteNumber(context.lng)) {
    url.searchParams.set("point", `${context.lat!.toFixed(4)},${context.lng!.toFixed(4)}`);
  } else if (context.state) {
    const stateCode = stateToCode(context.state);
    if (stateCode) url.searchParams.set("area", stateCode);
  } else {
    url.searchParams.set("limit", "15");
  }

  const data = await fetchJson<any>(url.toString());
  return (data.features || []).slice(0, 10).map((feature: any) => {
    const props = feature.properties || {};
    const category = inferCategory("weather", props.event, props.description);
    return makeAlert({
      id: props.id || feature.id || props.event,
      title: props.headline || props.event || "Weather alert",
      category,
      summary: props.description || props.instruction || props.event,
      location: props.areaDesc || context.city || context.state || "National Weather Service area",
      sourceName: feed.sourceName,
      sourceUrl: props["@id"] || feed.sourceUrl,
      updatedAt: props.effective || props.sent || props.updated,
      severity: nwsSeverity(props.severity, props.certainty, props.urgency),
      country: "US",
    });
  });
}

async function loadFemaAlerts(feed: AlertFeedConfig, context: AlertRequestContext): Promise<LiveAlert[]> {
  const stateCode = context.state ? stateToCode(context.state) : null;
  const select = "disasterNumber,state,declarationTitle,declarationDate,incidentType,designatedArea,lastRefresh,incidentBeginDate";
  const filter = stateCode ? `&%24filter=state%20eq%20%27${encodeURIComponent(stateCode)}%27` : "";
  const url = `${feed.apiUrl}?%24select=${select}&%24orderby=declarationDate%20desc&%24top=18${filter}&%24metadata=off`;
  const data = await fetchJson<any>(url);
  const seen = new Set<string>();

  return (data.DisasterDeclarationsSummaries || [])
    .filter((item: any) => {
      const key = `${item.disasterNumber}-${item.state}-${item.declarationTitle}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3)
    .map((item: any) =>
      makeAlert({
        id: `${item.disasterNumber}-${item.state}`,
        title: `${titleCase(item.incidentType || "Disaster")} - ${titleCase(item.declarationTitle || "FEMA update")}`,
        category: inferCategory("local", item.incidentType, item.declarationTitle),
        summary: `${titleCase(item.incidentType || "Emergency")} declaration for ${item.designatedArea || item.state}.`,
        location: `${item.designatedArea || "Area"} ${item.state || ""}`.trim(),
        sourceName: feed.sourceName,
        sourceUrl: feed.sourceUrl,
        updatedAt: item.declarationDate || item.lastRefresh || item.incidentBeginDate,
        severity: "advisory",
        country: "US",
      })
    );
}

async function loadCpscRecalls(feed: AlertFeedConfig, _context: AlertRequestContext): Promise<LiveAlert[]> {
  const since = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const data = await fetchJson<any[]>(`${feed.apiUrl}&RecallDateStart=${since}`);
  return (Array.isArray(data) ? data : [])
    .slice(0, 3)
    .map((item: any) => {
      const hazard = Array.isArray(item.Hazards) ? item.Hazards[0]?.Name : "";
      return makeAlert({
        id: String(item.RecallID || item.RecallNumber || item.Title),
        title: item.Title || "Product safety recall",
        category: "recall",
        summary: hazard || item.Description || item.ConsumerContact || "CPSC has published a product recall.",
        location: "United States",
        sourceName: feed.sourceName,
        sourceUrl: item.URL || feed.sourceUrl,
        updatedAt: item.LastPublishDate || item.RecallDate,
        severity: inferSeverity("", item.Title, `${hazard} ${item.Description}`),
        country: "US",
      });
    });
}

async function loadEnvironmentAgencyFloods(feed: AlertFeedConfig, context: AlertRequestContext): Promise<LiveAlert[]> {
  const data = await fetchJson<any>(feed.apiUrl!);
  return (data.items || []).slice(0, 16).map((item: any) =>
    makeAlert({
      id: item["@id"] || item.floodAreaID || item.message || item.description,
      title: item.message || item.description || "Flood warning",
      category: "flood",
      summary: item.description || item.message || "Flood warning issued by the Environment Agency.",
      location: item.eaAreaName || item.floodArea?.county || item.floodArea?.riverOrSea || context.city || "England",
      sourceName: feed.sourceName,
      sourceUrl: item["@id"] || feed.sourceUrl,
      updatedAt: item.timeMessageChanged || item.timeRaised,
      severity: eaSeverity(item.severityLevel),
      country: "GB",
    })
  );
}

async function fetchJson<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "EmergencyTradesmen/1.0 (live-alerts)",
      },
    });
    if (!response.ok) throw new Error(`JSON source returned ${response.status}`);
    return response.json() as Promise<T>;
  } finally {
    clearTimeout(timeout);
  }
}

function rankAndLimit(alerts: LiveAlert[], context: AlertRequestContext) {
  const seen = new Set<string>();
  const hasSpecificLocation = Boolean(context.city || context.state || (context.lat && context.lng));
  const locationFiltered = alerts.filter((alert) => {
    if (!hasSpecificLocation) return true;
    if (alert.sourceName === "National Weather Service") return true;
    if (alert.sourceName === "Met Office") return true;
    if (alert.category === "recall") return true;
    return containsLocation(alert, context.city, context.state);
  });

  return locationFiltered
    .filter((alert) => {
      const key = `${alert.sourceName}:${cleanupText(alert.title).toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const severityDelta = severityScore(b.severity) - severityScore(a.severity);
      if (severityDelta) return severityDelta;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, 8);
}

function json(payload: unknown, status = 200, headers?: Record<string, string>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      ...headers,
    },
  });
}

function makeCacheKey(context: AlertRequestContext) {
  const lat = isFiniteNumber(context.lat) ? context.lat!.toFixed(2) : "";
  const lng = isFiniteNumber(context.lng) ? context.lng!.toFixed(2) : "";
  return [context.country, context.city || "", context.state || "", lat, lng].join(":").toLowerCase();
}

function shortestTtl(feeds: AlertFeedConfig[]) {
  return Math.min(...feeds.map((feed) => feed.cacheTtlMs));
}

function parseFinite(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanParam(value: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 1 ? trimmed.slice(0, 80) : null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function nwsSeverity(severity?: string, certainty?: string, urgency?: string) {
  return inferSeverity(`${severity || ""} ${certainty || ""} ${urgency || ""}`);
}

function eaSeverity(level?: number | string) {
  const parsed = Number(level);
  if (parsed === 1) return "severe";
  if (parsed === 2) return "warning";
  if (parsed === 3) return "advisory";
  return "info";
}

function titleCase(value: string) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function stateToCode(value: string) {
  const clean = value.trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(clean)) return clean;
  const match = US_STATE_CODES.find((state) => state.name.toUpperCase() === clean || state.slug.toUpperCase() === clean);
  return match?.code || null;
}

const US_STATE_CODES = [
  { name: "Alabama", slug: "alabama", code: "AL" },
  { name: "Alaska", slug: "alaska", code: "AK" },
  { name: "Arizona", slug: "arizona", code: "AZ" },
  { name: "Arkansas", slug: "arkansas", code: "AR" },
  { name: "California", slug: "california", code: "CA" },
  { name: "Colorado", slug: "colorado", code: "CO" },
  { name: "Connecticut", slug: "connecticut", code: "CT" },
  { name: "Delaware", slug: "delaware", code: "DE" },
  { name: "District of Columbia", slug: "district-of-columbia", code: "DC" },
  { name: "Florida", slug: "florida", code: "FL" },
  { name: "Georgia", slug: "georgia", code: "GA" },
  { name: "Hawaii", slug: "hawaii", code: "HI" },
  { name: "Idaho", slug: "idaho", code: "ID" },
  { name: "Illinois", slug: "illinois", code: "IL" },
  { name: "Indiana", slug: "indiana", code: "IN" },
  { name: "Iowa", slug: "iowa", code: "IA" },
  { name: "Kansas", slug: "kansas", code: "KS" },
  { name: "Kentucky", slug: "kentucky", code: "KY" },
  { name: "Louisiana", slug: "louisiana", code: "LA" },
  { name: "Maine", slug: "maine", code: "ME" },
  { name: "Maryland", slug: "maryland", code: "MD" },
  { name: "Massachusetts", slug: "massachusetts", code: "MA" },
  { name: "Michigan", slug: "michigan", code: "MI" },
  { name: "Minnesota", slug: "minnesota", code: "MN" },
  { name: "Mississippi", slug: "mississippi", code: "MS" },
  { name: "Missouri", slug: "missouri", code: "MO" },
  { name: "Montana", slug: "montana", code: "MT" },
  { name: "Nebraska", slug: "nebraska", code: "NE" },
  { name: "Nevada", slug: "nevada", code: "NV" },
  { name: "New Hampshire", slug: "new-hampshire", code: "NH" },
  { name: "New Jersey", slug: "new-jersey", code: "NJ" },
  { name: "New Mexico", slug: "new-mexico", code: "NM" },
  { name: "New York", slug: "new-york", code: "NY" },
  { name: "North Carolina", slug: "north-carolina", code: "NC" },
  { name: "North Dakota", slug: "north-dakota", code: "ND" },
  { name: "Ohio", slug: "ohio", code: "OH" },
  { name: "Oklahoma", slug: "oklahoma", code: "OK" },
  { name: "Oregon", slug: "oregon", code: "OR" },
  { name: "Pennsylvania", slug: "pennsylvania", code: "PA" },
  { name: "Rhode Island", slug: "rhode-island", code: "RI" },
  { name: "South Carolina", slug: "south-carolina", code: "SC" },
  { name: "South Dakota", slug: "south-dakota", code: "SD" },
  { name: "Tennessee", slug: "tennessee", code: "TN" },
  { name: "Texas", slug: "texas", code: "TX" },
  { name: "Utah", slug: "utah", code: "UT" },
  { name: "Vermont", slug: "vermont", code: "VT" },
  { name: "Virginia", slug: "virginia", code: "VA" },
  { name: "Washington", slug: "washington", code: "WA" },
  { name: "West Virginia", slug: "west-virginia", code: "WV" },
  { name: "Wisconsin", slug: "wisconsin", code: "WI" },
  { name: "Wyoming", slug: "wyoming", code: "WY" },
];
