import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock3, Filter, RefreshCw, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { calculateTrustScore, getTrustBadgesForBusiness, type TrustEvidenceRow, type TrustRegion } from "@/lib/trust/trustBadges";

type EvidenceStatus = "pending" | "accepted" | "rejected" | "expired";

interface EvidenceRow extends TrustEvidenceRow {
  raw?: Record<string, unknown> | null;
  businesses?: {
    id?: string;
    name?: string;
    trade?: string;
    city?: string;
    country_code?: string;
    phone?: string | null;
    claim_status?: string | null;
  } | null;
}

const confidenceOptions = [
  { label: "Any confidence", min: "", max: "" },
  { label: "High 0.80+", min: "0.80", max: "" },
  { label: "Medium 0.50-0.79", min: "0.50", max: "0.79" },
  { label: "Low under 0.50", min: "", max: "0.49" },
];

function summarizeRaw(raw?: Record<string, unknown> | null) {
  if (!raw || typeof raw !== "object") return "No raw summary";

  const preferredKeys = [
    "url",
    "status",
    "httpStatus",
    "matchedName",
    "matchedPhone",
    "company_number",
    "company_status",
    "title",
    "message",
  ];

  const parts = preferredKeys
    .filter((key) => raw[key] !== undefined && raw[key] !== null && raw[key] !== "")
    .map((key) => `${key}: ${String(raw[key]).slice(0, 90)}`);

  if (parts.length > 0) return parts.join(" | ");
  return `Keys: ${Object.keys(raw).slice(0, 8).join(", ")}`;
}

export default function EvidencePage() {
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [region, setRegion] = useState<"all" | TrustRegion>("all");
  const [source, setSource] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [confidenceRange, setConfidenceRange] = useState(0);
  const { toast } = useToast();

  const loadEvidence = useCallback(async () => {
    setIsLoading(true);

    let query = supabase
      .from("business_field_evidence")
      .select("*, businesses(id,name,trade,city,country_code,phone,claim_status)")
      .eq("status", "pending")
      .order("verified_at", { ascending: false })
      .limit(100);

    if (region !== "all") query = query.eq("region", region);
    if (source.trim()) query = query.ilike("source", `%${source.trim()}%`);
    if (fieldName.trim()) query = query.ilike("field_name", `%${fieldName.trim()}%`);

    const selectedConfidence = confidenceOptions[confidenceRange];
    if (selectedConfidence.min) query = query.gte("confidence", Number(selectedConfidence.min));
    if (selectedConfidence.max) query = query.lte("confidence", Number(selectedConfidence.max));

    const { data, error } = await query;

    if (error) {
      console.error("Failed to load evidence", error);
      toast({ title: "Error", description: "Failed to load pending evidence.", variant: "destructive" });
    } else {
      setRows((data || []) as EvidenceRow[]);
    }

    setIsLoading(false);
  }, [confidenceRange, fieldName, region, source, toast]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  const recomputeBusinessTrust = async (businessId: string, evidenceRegion: TrustRegion, business?: EvidenceRow["businesses"]) => {
    const { data: evidenceRows, error } = await supabase
      .from("business_field_evidence")
      .select("id,region,business_id,field_name,value,source,confidence,status,verified_at,expires_at,created_at")
      .eq("business_id", businessId)
      .eq("region", evidenceRegion)
      .eq("status", "accepted");

    if (error) throw error;

    const businessForBadges = {
      id: businessId,
      name: business?.name || "Business",
      rating: 0,
      reviewCount: 0,
      hours: "",
      isOpen24Hours: false,
      phone: business?.phone || undefined,
      claim_status: business?.claim_status || undefined,
      country_code: evidenceRegion === "US" ? "US" : "GB",
    };

    const acceptedEvidence = (evidenceRows || []) as TrustEvidenceRow[];
    const badges = getTrustBadgesForBusiness(businessForBadges, acceptedEvidence).map((badge) => badge.id);
    const trustScore = calculateTrustScore(acceptedEvidence);

    const { error: updateError } = await supabase
      .from("businesses")
      .update({ trust_badges: badges, trust_score: trustScore })
      .eq("id", businessId);

    if (updateError) throw updateError;
  };

  const updateEvidenceStatus = async (row: EvidenceRow, status: EvidenceStatus) => {
    const { data: authData } = await supabase.auth.getUser();
    const reviewedBy = authData.user?.id || null;

    const { error } = await supabase
      .from("business_field_evidence")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewedBy,
      })
      .eq("id", row.id);

    if (error) {
      toast({ title: "Error", description: `Failed to mark evidence ${status}.`, variant: "destructive" });
      return;
    }

    try {
      await recomputeBusinessTrust(row.business_id, row.region, row.businesses);
    } catch (recomputeError) {
      console.error("Failed to recompute trust", recomputeError);
      toast({ title: "Evidence updated", description: "Evidence status changed, but trust recompute failed.", variant: "destructive" });
      loadEvidence();
      return;
    }

    toast({ title: "Evidence updated", description: `Evidence marked ${status}.` });
    loadEvidence();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-display text-foreground mb-2">Evidence Review</h1>
          <p className="text-muted-foreground">Review pending listing evidence before it can power public trust badges.</p>
        </div>
        <Button variant="outline" onClick={loadEvidence} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground md:col-span-5">
          <Filter className="h-4 w-4" />
          Filters
        </div>
        <select value={region} onChange={(event) => setRegion(event.target.value as "all" | TrustRegion)} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="all">All regions</option>
          <option value="UK">UK</option>
          <option value="US">US</option>
        </select>
        <Input placeholder="Source" value={source} onChange={(event) => setSource(event.target.value)} />
        <Input placeholder="Field name" value={fieldName} onChange={(event) => setFieldName(event.target.value)} />
        <select value={confidenceRange} onChange={(event) => setConfidenceRange(Number(event.target.value))} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          {confidenceOptions.map((option, index) => (
            <option key={option.label} value={index}>{option.label}</option>
          ))}
        </select>
        <Button type="button" variant="secondary" onClick={loadEvidence}>Apply</Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
            <tr>
              <th className="p-4 font-semibold">Business</th>
              <th className="p-4 font-semibold">Evidence</th>
              <th className="p-4 font-semibold">Confidence</th>
              <th className="p-4 font-semibold">Raw Summary</th>
              <th className="p-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-secondary/20">
                <td className="p-4">
                  <div className="font-medium text-foreground">{row.businesses?.name || row.business_id}</div>
                  <div className="text-xs text-muted-foreground">{row.businesses?.trade || "Unknown trade"} · {row.businesses?.city || "Unknown city"}</div>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gold">{row.region}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium text-foreground">{row.field_name}</div>
                  <div className="text-xs text-muted-foreground">Source: {row.source}</div>
                  <div className="mt-1 text-sm">{row.value || "No proposed value"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{row.verified_at ? new Date(row.verified_at).toLocaleString() : "No date"}</div>
                </td>
                <td className="p-4">
                  <span className="rounded-full border border-border bg-secondary px-2 py-1 text-xs font-bold">
                    {Number(row.confidence).toFixed(2)}
                  </span>
                </td>
                <td className="max-w-md p-4 text-xs leading-relaxed text-muted-foreground">
                  {summarizeRaw(row.raw)}
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => updateEvidenceStatus(row, "accepted")}>
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => updateEvidenceStatus(row, "rejected")}>
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => updateEvidenceStatus(row, "expired")}>
                      <Clock3 className="mr-1 h-3.5 w-3.5" />
                      Expire
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="py-16 text-center">
            <p className="font-medium text-foreground">{isLoading ? "Loading evidence..." : "No pending evidence found"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Accepted or rejected evidence will not appear in this pending queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
