import type { AlertCategory, AlertCountry, LiveAlert } from "./types";

const UK_ROUTE_RULES: Partial<Record<AlertCategory, string[]>> = {
  weather: ["roofer", "builder", "glazier", "drain-specialist"],
  flood: ["plumber", "drain-specialist", "water-restoration"],
  traffic: ["breakdown"],
  power: ["electrician"],
  recall: ["electrician"],
  safety: ["electrician", "gas-engineer"],
  local: ["builder"],
};

const US_ROUTE_RULES: Partial<Record<AlertCategory, string[]>> = {
  weather: ["roofer", "water-restoration", "builder"],
  flood: ["plumber", "water-restoration", "drain-specialist"],
  traffic: ["breakdown"],
  power: ["electrician"],
  recall: ["electrician", "hvac"],
  safety: ["electrician", "hvac"],
  local: ["builder", "water-restoration"],
};

const tradeLabels: Record<string, { GB: string; US: string }> = {
  plumber: { GB: "plumbers", US: "plumbers" },
  electrician: { GB: "electricians", US: "electricians" },
  "gas-engineer": { GB: "gas engineers", US: "HVAC technicians" },
  "drain-specialist": { GB: "drainage specialists", US: "drainage contractors" },
  glazier: { GB: "emergency glaziers", US: "glass repair contractors" },
  roofer: { GB: "roofers", US: "roof repair contractors" },
  builder: { GB: "builders", US: "emergency contractors" },
  "water-restoration": { GB: "water damage restoration", US: "water damage restoration" },
  breakdown: { GB: "breakdown recovery", US: "towing and roadside assistance" },
  hvac: { GB: "HVAC and air conditioning", US: "HVAC and AC repair" },
};

export function getAlertTradeSlugs(alert: Pick<LiveAlert, "category" | "title" | "summary">, country: AlertCountry): string[] {
  const text = `${alert.title} ${alert.summary}`.toLowerCase();
  const baseRules = country === "US" ? US_ROUTE_RULES : UK_ROUTE_RULES;

  if (/\b(power|outage|electric|shock|charger|battery|fire risk|overheat|overheating)\b/.test(text)) {
    return ["electrician"];
  }

  if (/\b(furnace|heating|boiler|cold|freeze|frozen|winter|ice|snow)\b/.test(text)) {
    return country === "US" ? ["hvac", "plumber"] : ["gas-engineer", "plumber"];
  }

  if (/\b(heat|hot|air quality|cooling|air conditioning|ac\b)\b/.test(text)) {
    return country === "US" ? ["hvac", "electrician"] : ["hvac", "electrician"];
  }

  if (/\b(flood|flooding|water|sewer|drain)\b/.test(text)) {
    return country === "US" ? ["water-restoration", "plumber"] : ["plumber", "drain-specialist"];
  }

  return baseRules[alert.category] ?? ["builder"];
}

export function getAlertHelpTarget(alert: Pick<LiveAlert, "category" | "title" | "summary">, country: AlertCountry, city?: string | null) {
  const tradeSlug = getAlertTradeSlugs(alert, country)[0] || "builder";
  const label = tradeLabels[tradeSlug]?.[country] || "emergency help";
  const citySlug = city ? slugify(city) : "";
  const href = citySlug ? `/emergency-${tradeSlug}/${citySlug}` : `/emergency-${tradeSlug}-near-me`;

  return { tradeSlug, label, href };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

