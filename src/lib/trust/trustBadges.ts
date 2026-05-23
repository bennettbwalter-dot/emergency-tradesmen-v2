import type { Business } from "@/lib/businesses";

export type TrustRegion = "UK" | "US";

export type TrustBadgeId =
  | "phone_present"
  | "website_checked"
  | "owner_claimed"
  | "companies_house_active"
  | "registry_checked"
  | "response_tracking_enabled";

export interface TrustEvidenceRow {
  id?: number;
  region: TrustRegion;
  business_id: string;
  field_name: string;
  value?: string | null;
  source: string;
  confidence: number;
  status: "pending" | "accepted" | "rejected" | "expired";
  verified_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
}

export interface TrustBadge {
  id: TrustBadgeId;
  label: string;
  tooltip: string;
  region: TrustRegion;
}

const TOOLTIP_COPY: Record<TrustBadgeId, string> = {
  phone_present: "This listing includes a phone number. This does not guarantee availability.",
  website_checked: "We found a working website for this business. Details may still change.",
  owner_claimed: "The business owner or representative has started/confirmed a claim for this listing.",
  companies_house_active: "UK company status was checked against Companies House where a confident match was available.",
  registry_checked: "A relevant trade or licence register check has been recorded. Open the listing for details where available.",
  response_tracking_enabled: "We can track response behaviour for leads sent through the platform. No response-time guarantee is made yet.",
};

export function regionFromCountryCode(countryCode?: string | null): TrustRegion {
  return String(countryCode || "GB").toUpperCase() === "US" ? "US" : "UK";
}

export function getTrustBadgeLabel(id: TrustBadgeId, region: TrustRegion): string {
  if (id === "companies_house_active") return "Companies House active";
  if (id === "registry_checked") return region === "US" ? "Licence/register checked" : "Trade register checked";
  if (id === "phone_present") return "Phone number listed";
  if (id === "website_checked") return "Website checked";
  if (id === "owner_claimed") return "Owner claimed";
  return "Response tracking enabled";
}

function hasAcceptedEvidence(
  evidenceRows: TrustEvidenceRow[],
  region: TrustRegion,
  predicate: (row: TrustEvidenceRow) => boolean,
) {
  return evidenceRows.some((row) => {
    if (row.region !== region || row.status !== "accepted") return false;
    if (row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) return false;
    return predicate(row);
  });
}

function isOwnerClaimed(business: Business, evidenceRows: TrustEvidenceRow[], region: TrustRegion) {
  const claimStatus = String(business.claim_status || "").toLowerCase();
  return (
    claimStatus === "verified" ||
    claimStatus === "claimed" ||
    claimStatus === "public_claimed" ||
    hasAcceptedEvidence(evidenceRows, region, (row) => row.field_name === "owner_claim" || row.source === "owner_claim")
  );
}

export function getTrustBadgesForBusiness(
  business: Business,
  evidenceRows: TrustEvidenceRow[] = [],
): TrustBadge[] {
  const region = regionFromCountryCode(business.country_code);
  const badges: TrustBadgeId[] = [];

  if (business.phone || hasAcceptedEvidence(evidenceRows, region, (row) => row.field_name === "phone")) {
    badges.push("phone_present");
  }

  if (hasAcceptedEvidence(evidenceRows, region, (row) => row.field_name === "website" && row.source === "own_website")) {
    badges.push("website_checked");
  }

  if (isOwnerClaimed(business, evidenceRows, region)) {
    badges.push("owner_claimed");
  }

  if (
    region === "UK" &&
    hasAcceptedEvidence(
      evidenceRows,
      region,
      (row) => row.source === "companies_house" && row.field_name === "company_status" && row.value === "active",
    )
  ) {
    badges.push("companies_house_active");
  }

  if (
    hasAcceptedEvidence(
      evidenceRows,
      region,
      (row) =>
        row.field_name === "registry_status" ||
        row.source === "registry_lookup" ||
        row.source === "companies_house",
    )
  ) {
    badges.push("registry_checked");
  }

  if (
    hasAcceptedEvidence(
      evidenceRows,
      region,
      (row) => row.field_name === "response_tracking" || row.source === "response_tracking",
    )
  ) {
    badges.push("response_tracking_enabled");
  }

  return badges.map((id) => ({
    id,
    label: getTrustBadgeLabel(id, region),
    tooltip: TOOLTIP_COPY[id],
    region,
  }));
}

export function calculateTrustScore(evidenceRows: TrustEvidenceRow[] = []): number {
  const acceptedRows = evidenceRows.filter((row) => row.status === "accepted");
  let score = 0;

  if (acceptedRows.some((row) => row.field_name === "phone")) score += 0.2;
  if (acceptedRows.some((row) => row.field_name === "website" && row.source === "own_website")) score += 0.2;
  if (acceptedRows.some((row) => row.field_name === "owner_claim" || row.source === "owner_claim")) score += 0.2;
  if (
    acceptedRows.some(
      (row) =>
        (row.field_name === "company_status" && row.source === "companies_house" && row.value === "active") ||
        (row.field_name === "registry_status" && row.value === "active"),
    )
  ) {
    score += 0.25;
  }
  if (acceptedRows.some((row) => row.field_name === "response_tracking" || row.source === "response_tracking")) score += 0.15;

  return Math.min(1, Number(score.toFixed(2)));
}
