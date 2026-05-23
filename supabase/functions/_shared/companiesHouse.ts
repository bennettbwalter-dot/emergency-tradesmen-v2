type TrustRegion = "UK" | "US";

export interface CompaniesHouseLookupInput {
  region: TrustRegion;
  businessId: string;
  businessName: string;
  companyNumber?: string | null;
  postcode?: string | null;
}

export interface CompaniesHouseMatch {
  registry: "companies_house";
  registryId?: string;
  status: "active" | "inactive" | "dissolved" | "not_found" | "pending_review";
  confidence: number;
  raw: Record<string, unknown>;
}

interface CompanySearchItem {
  title?: string;
  company_number?: string;
  company_status?: string;
  address_snippet?: string;
  [key: string]: unknown;
}

interface CompaniesHouseSearchResponse {
  items?: CompanySearchItem[];
  [key: string]: unknown;
}

interface SupabaseInsertClient {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>) => Promise<{ error?: Error | null }>;
  };
}

const API_BASE = "https://api.company-information.service.gov.uk";
const MAX_REQUESTS_PER_WINDOW = 580;
const WINDOW_MS = 5 * 60 * 1000;
let windowStartedAt = 0;
let requestCount = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForRateLimitSlot() {
  const now = Date.now();
  if (!windowStartedAt || now - windowStartedAt >= WINDOW_MS) {
    windowStartedAt = now;
    requestCount = 0;
  }

  if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
    await sleep(WINDOW_MS - (now - windowStartedAt) + 250);
    windowStartedAt = Date.now();
    requestCount = 0;
  }

  requestCount += 1;
}

function authHeader(apiKey: string) {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

async function companiesHouseFetch(path: string, apiKey: string, attempt = 1): Promise<Response> {
  await waitForRateLimitSlot();

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: authHeader(apiKey),
      Accept: "application/json",
    },
  });

  if (response.status === 429 && attempt <= 3) {
    const retryAfter = Number(response.headers.get("retry-after") || "2");
    await sleep(Math.max(1, retryAfter) * 1000);
    return companiesHouseFetch(path, apiKey, attempt + 1);
  }

  return response;
}

function normalize(value?: string | null) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function scoreCompanyMatch(item: CompanySearchItem, businessName: string, postcode?: string | null) {
  const nameScore = normalize(item.title) === normalize(businessName)
    ? 0.75
    : normalize(item.title).includes(normalize(businessName)) || normalize(businessName).includes(normalize(item.title))
      ? 0.55
      : 0.25;

  const addressSnippet = normalize(item.address_snippet);
  const postcodeScore = postcode && addressSnippet.includes(normalize(postcode)) ? 0.2 : 0;
  const activeScore = item.company_status === "active" ? 0.05 : 0;

  return Math.min(1, Number((nameScore + postcodeScore + activeScore).toFixed(2)));
}

export async function lookupCompaniesHouse(input: CompaniesHouseLookupInput): Promise<CompaniesHouseMatch> {
  if (input.region !== "UK") {
    return {
      registry: "companies_house",
      status: "pending_review",
      confidence: 0,
      raw: { skipped: true, reason: "Companies House lookup is UK-only" },
    };
  }

  const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
  if (!apiKey) {
    throw new Error("COMPANIES_HOUSE_API_KEY is not configured");
  }

  if (input.companyNumber) {
    const response = await companiesHouseFetch(`/company/${encodeURIComponent(input.companyNumber)}`, apiKey);
    if (response.status === 404) {
      return {
        registry: "companies_house",
        registryId: input.companyNumber,
        status: "not_found",
        confidence: 0.8,
        raw: { companyNumber: input.companyNumber, httpStatus: 404 },
      };
    }
    if (!response.ok) throw new Error(`Companies House returned ${response.status}`);

    const raw = await response.json();
    const status = raw.company_status === "active" ? "active" : raw.company_status === "dissolved" ? "dissolved" : "inactive";
    return {
      registry: "companies_house",
      registryId: raw.company_number || input.companyNumber,
      status,
      confidence: 0.95,
      raw,
    };
  }

  const response = await companiesHouseFetch(`/search/companies?q=${encodeURIComponent(input.businessName)}&items_per_page=5`, apiKey);
  if (!response.ok) throw new Error(`Companies House returned ${response.status}`);

  const raw = (await response.json()) as CompaniesHouseSearchResponse;
  const matches = (raw.items || [])
    .map((item) => ({ item, confidence: scoreCompanyMatch(item, input.businessName, input.postcode) }))
    .sort((a, b) => b.confidence - a.confidence);

  const best = matches[0];
  if (!best || best.confidence < 0.7) {
    return {
      registry: "companies_house",
      status: "pending_review",
      confidence: best?.confidence || 0,
      raw,
    };
  }

  return {
    registry: "companies_house",
    registryId: best.item.company_number,
    status: best.item.company_status === "active" ? "active" : best.item.company_status === "dissolved" ? "dissolved" : "inactive",
    confidence: best.confidence,
    raw: best.item,
  };
}

export async function storeCompaniesHouseVerification(supabaseClient: SupabaseInsertClient, input: CompaniesHouseLookupInput, match: CompaniesHouseMatch) {
  if (input.region !== "UK") {
    await supabaseClient.from("enrichment_runs").insert({
      region: input.region,
      business_id: input.businessId,
      run_type: "companies_house_lookup",
      status: "skipped",
      message: "Companies House lookup is UK-only.",
      result: match.raw,
    });
    return;
  }

  const registryPayload = {
    region: "UK",
    business_id: input.businessId,
    registry: "companies_house",
    registry_id: match.registryId || null,
    status: match.status,
    confidence: match.confidence,
    next_check_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    raw: match.raw,
  };

  const { error: registryError } = await supabaseClient.from("registry_verifications").insert(registryPayload);
  if (registryError) throw registryError;

  const shouldAccept = match.status === "active" && match.confidence >= 0.9;
  const { error: evidenceError } = await supabaseClient.from("business_field_evidence").insert({
    region: "UK",
    business_id: input.businessId,
    field_name: "company_status",
    value: match.status,
    source: "companies_house",
    confidence: match.confidence,
    status: shouldAccept ? "accepted" : "pending",
    raw: match.raw,
  });
  if (evidenceError) throw evidenceError;

  await supabaseClient.from("enrichment_runs").insert({
    region: "UK",
    business_id: input.businessId,
    run_type: "companies_house_lookup",
    status: "succeeded",
    message: `Companies House returned ${match.status}.`,
    result: { registry_id: match.registryId, status: match.status, confidence: match.confidence },
  });
}
