import type { SupabaseClient } from "@supabase/supabase-js";
import type { TrustRegion } from "@/lib/trust/trustBadges";

export interface WebsiteCheckInput {
  region: TrustRegion;
  businessId: string;
  businessName: string;
  websiteUrl: string;
  phone?: string | null;
}

export interface WebsiteCheckResult {
  url: string;
  httpStatus?: number;
  isLive: boolean;
  appearsParked: boolean;
  matchedName: boolean;
  matchedPhone: boolean;
  hasLocalBusinessJsonLd: boolean;
  confidence: number;
  status: "pending" | "accepted";
  message: string;
}

const parkedSignals = [
  "domain is for sale",
  "buy this domain",
  "parked free",
  "sedo domain parking",
  "godaddy.com/forsale",
  "namecheap parking",
];

function normalizeWebsiteUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) throw new Error("Website URL is required");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function visibleTextFromHtml(html: string) {
  if (typeof DOMParser !== "undefined") {
    const document = new DOMParser().parseFromString(html, "text/html");
    document.querySelectorAll("script, style, noscript, svg").forEach((node) => node.remove());
    return document.body?.textContent || "";
  }

  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
}

function hasLocalBusinessJsonLd(html: string) {
  return /"@type"\s*:\s*"?(LocalBusiness|Plumber|Electrician|Locksmith|RoofingContractor|HVACBusiness)"?/i.test(html);
}

export async function checkBusinessWebsite(input: WebsiteCheckInput): Promise<WebsiteCheckResult> {
  const url = normalizeWebsiteUrl(input.websiteUrl);
  const response = await fetch(url, {
    redirect: "follow",
    headers: { Accept: "text/html,application/xhtml+xml" },
  });

  const html = await response.text();
  const text = normalizeText(visibleTextFromHtml(html));
  const normalizedName = normalizeText(input.businessName);
  const normalizedPhone = String(input.phone || "").replace(/\D/g, "");
  const pageDigits = text.replace(/\D/g, "");
  const appearsParked = parkedSignals.some((signal) => text.includes(signal));
  const matchedName = normalizedName.length > 3 && text.includes(normalizedName);
  const matchedPhone = normalizedPhone.length >= 7 && pageDigits.includes(normalizedPhone);
  const localBusinessJsonLd = hasLocalBusinessJsonLd(html);
  const isLive = response.ok && !appearsParked;

  let confidence = 0;
  if (isLive && (matchedName || matchedPhone)) confidence = 0.8;
  else if (isLive) confidence = 0.6;
  if (confidence >= 0.8 && localBusinessJsonLd) confidence = 0.9;

  return {
    url: response.url || url,
    httpStatus: response.status,
    isLive,
    appearsParked,
    matchedName,
    matchedPhone,
    hasLocalBusinessJsonLd: localBusinessJsonLd,
    confidence,
    status: confidence >= 0.9 ? "accepted" : "pending",
    message: isLive ? "Website responded and was checked for visible business evidence." : "Website did not return a strong live-site signal.",
  };
}

export async function storeWebsiteCheckEvidence(
  supabase: SupabaseClient,
  input: WebsiteCheckInput,
  result: WebsiteCheckResult,
) {
  const { error: evidenceError } = await supabase.from("business_field_evidence").insert({
    region: input.region,
    business_id: input.businessId,
    field_name: "website",
    value: result.url,
    source: "own_website",
    confidence: result.confidence,
    status: result.status,
    raw: result,
  });

  const { error: runError } = await supabase.from("enrichment_runs").insert({
    region: input.region,
    business_id: input.businessId,
    run_type: "website_check",
    status: evidenceError ? "failed" : "succeeded",
    message: evidenceError?.message || result.message,
    result,
  });

  if (evidenceError) throw evidenceError;
  if (runError) throw runError;
}
