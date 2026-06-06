import type { AlertCategory, AlertCountry, AlertSeverity, LiveAlert } from "./types";

export function categoryLabel(category: AlertCategory) {
  const labels: Record<AlertCategory, string> = {
    weather: "Weather warning",
    flood: "Flood warning",
    traffic: "Traffic incident",
    power: "Power outage",
    recall: "Product recall",
    safety: "Safety warning",
    local: "Local emergency update",
  };
  return labels[category];
}

export function inferCategory(seed: AlertCategory, title = "", summary = ""): AlertCategory {
  const text = `${title} ${summary}`.toLowerCase();
  if (/\b(flood|flooding|river|coastal|sewer|flash flood)\b/.test(text)) return "flood";
  if (/\b(road|traffic|collision|carriageway|motorway|lane|junction|towing)\b/.test(text)) return "traffic";
  if (/\b(power cut|power outage|outage|electricity outage|blackout)\b/.test(text)) return "power";
  if (/\b(recall|recalled|product safety|unsafe product)\b/.test(text)) return "recall";
  if (/\b(fire|carbon monoxide|gas leak|shock|burn|hazard|danger|injury|death)\b/.test(text)) return seed === "recall" ? "recall" : "safety";
  if (/\b(weather|storm|wind|rain|snow|ice|heat|cold|thunder|hurricane|tornado|winter)\b/.test(text)) return "weather";
  return seed;
}

export function inferSeverity(value = "", title = "", summary = ""): AlertSeverity {
  const text = `${value} ${title} ${summary}`.toLowerCase();
  if (/\b(extreme|severe|danger to life|emergency|red warning|major|catastrophic)\b/.test(text)) return "severe";
  if (/\b(warning|amber|flood warning|fire risk|shock|burn|death|serious injury)\b/.test(text)) return "warning";
  if (/\b(watch)\b/.test(text)) return "watch";
  if (/\b(advisory|yellow|alert|minor|statement)\b/.test(text)) return "advisory";
  return "info";
}

export function summarize(value: string, fallback = "Official alert source has published an update.") {
  const clean = value.replace(/\s+/g, " ").trim() || fallback;
  const firstSentence = clean.match(/^.{40,220}?[.!?](?:\s|$)/)?.[0]?.trim();
  const summary = firstSentence || clean;
  return summary.length > 210 ? `${summary.slice(0, 207).trim()}...` : summary;
}

export function containsLocation(alert: Pick<LiveAlert, "title" | "summary" | "location">, city?: string | null, state?: string | null) {
  const tokens = [city, state]
    .filter(Boolean)
    .map((value) => normalize(String(value)))
    .filter((value) => value.length > 2);

  if (tokens.length === 0) return true;
  const text = normalize(`${alert.title} ${alert.summary} ${alert.location}`);
  return tokens.some((token) => text.includes(token));
}

export function makeAlert(input: {
  id: string;
  title: string;
  category: AlertCategory;
  summary: string;
  location?: string;
  sourceName: string;
  sourceUrl?: string;
  updatedAt?: string;
  severity?: AlertSeverity;
  country: AlertCountry;
}): LiveAlert {
  const category = inferCategory(input.category, input.title, input.summary);
  return {
    id: stableId(input.sourceName, input.id || input.title),
    title: input.title.trim(),
    category,
    categoryLabel: categoryLabel(category),
    summary: summarize(input.summary),
    location: input.location?.trim() || "National",
    sourceName: input.sourceName,
    sourceUrl: input.sourceUrl,
    updatedAt: normalizeDate(input.updatedAt),
    severity: input.severity || inferSeverity("", input.title, input.summary),
    country: input.country,
  };
}

export function severityScore(severity: AlertSeverity) {
  return { severe: 5, warning: 4, watch: 3, advisory: 2, info: 1 }[severity];
}

function normalizeDate(value?: string) {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function stableId(source: string, raw: string) {
  let hash = 0;
  const value = `${source}:${raw}`;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return `${source.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${hash.toString(16)}`;
}

