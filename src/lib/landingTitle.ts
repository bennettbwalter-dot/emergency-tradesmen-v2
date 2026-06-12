import { trades, type Trade } from "@/lib/trades";

type CountryCode = "GB" | "US";

export interface LandingTitleParts {
  fullTitle: string;
  prefix: string;
  subject: string;
  preposition: "in" | "Near" | "near";
  location: string;
  hasLocation: boolean;
}

const COUNTRY_ONLY_VALUES = new Set([
  "GB",
  "GREAT BRITAIN",
  "UK",
  "UNITED KINGDOM",
  "US",
  "USA",
  "UNITED STATES",
  "UNITED STATES OF AMERICA",
]);

export function resolveLandingLocation(
  _countryCode: CountryCode,
  selectedLocation?: string | null,
  detectedLocation?: string | null
) {
  const candidates = [selectedLocation, detectedLocation];

  for (const candidate of candidates) {
    const normalized = normalizeLocation(candidate);
    if (!normalized) continue;
    return normalized;
  }

  return null;
}

export function buildLandingTitleParts(
  countryCode: CountryCode,
  location: string | null,
  tradeSlug?: string | null
): LandingTitleParts {
  const trade = trades.find((item) => item.slug === tradeSlug);

  if (!location) {
    const fallbackSubject = countryCode === "US" ? "Contractors" : "Tradesmen";
    return {
      fullTitle: `Local ${fallbackSubject} near ME`,
      prefix: "Local",
      subject: fallbackSubject,
      preposition: "near",
      location: "ME",
      hasLocation: false,
    };
  }

  const phrase = countryCode === "US"
    ? getUSTitlePhrase(location, trade)
    : getUKTitlePhrase(location, trade);

  return {
    ...phrase,
    fullTitle: `${phrase.prefix} ${phrase.subject} ${phrase.preposition} ${phrase.location}`,
    hasLocation: true,
  };
}

function getUKTitlePhrase(location: string, trade?: Trade): Omit<LandingTitleParts, "fullTitle" | "hasLocation"> {
  switch (trade?.slug) {
    case "plumber":
      return { prefix: "Find Local Emergency", subject: "Plumbers", preposition: "in", location };
    case "electrician":
      return { prefix: "Emergency", subject: "Electricians", preposition: "Near", location };
    case "locksmith":
      return { prefix: "Emergency", subject: "Locksmiths", preposition: "in", location };
    case "gas-engineer":
      return { prefix: "Emergency", subject: "Gas Engineers", preposition: "in", location };
    case "drain-specialist":
      return { prefix: "Emergency", subject: "Drain Specialists", preposition: "in", location };
    case "glazier":
      return { prefix: "Emergency", subject: "Glaziers", preposition: "in", location };
    case "roofer":
      return { prefix: "Emergency", subject: "Roofers", preposition: "in", location };
    case "builder":
      return { prefix: "Emergency", subject: "Builders", preposition: "in", location };
    case "water-restoration":
      return { prefix: "Emergency", subject: "Water Restoration Specialists", preposition: "in", location };
    case "breakdown":
      return { prefix: "Emergency", subject: "Breakdown Recovery", preposition: "Near", location };
    case "hvac":
      return { prefix: "Emergency", subject: "HVAC Engineers", preposition: "in", location };
    default:
      return { prefix: "Find Emergency", subject: "Tradesmen", preposition: "in", location };
  }
}

function getUSTitlePhrase(location: string, trade?: Trade): Omit<LandingTitleParts, "fullTitle" | "hasLocation"> {
  switch (trade?.slug) {
    case "plumber":
      return { prefix: "Find Local Emergency", subject: "Plumbers", preposition: "in", location };
    case "electrician":
      return { prefix: "Emergency", subject: "Electricians", preposition: "Near", location };
    case "locksmith":
      return { prefix: "Emergency", subject: "Locksmiths", preposition: "in", location };
    case "gas-engineer":
    case "hvac":
      return { prefix: "Emergency", subject: "HVAC Contractors", preposition: "in", location };
    case "drain-specialist":
      return { prefix: "Emergency", subject: "Drain Contractors", preposition: "in", location };
    case "glazier":
      return { prefix: "Emergency", subject: "Glass Repair Contractors", preposition: "in", location };
    case "roofer":
      return { prefix: "Emergency", subject: "Roofing Contractors", preposition: "in", location };
    case "builder":
      return { prefix: "Emergency", subject: "General Contractors", preposition: "in", location };
    case "water-restoration":
      return { prefix: "Emergency", subject: "Water Damage Contractors", preposition: "in", location };
    case "breakdown":
      return { prefix: "Emergency", subject: "Tow Trucks", preposition: "Near", location };
    default:
      return { prefix: "Find Emergency", subject: "Contractors", preposition: "in", location };
  }
}

function normalizeLocation(value?: string | null) {
  if (typeof value !== "string") return null;

  const normalized = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*(UK|GB|USA|US|United Kingdom|United States)$/i, "")
    .replace(/\s+\([^)]*\)$/g, "");

  if (normalized.length < 2) return null;
  if (COUNTRY_ONLY_VALUES.has(normalized.toUpperCase())) return null;

  return normalized;
}
