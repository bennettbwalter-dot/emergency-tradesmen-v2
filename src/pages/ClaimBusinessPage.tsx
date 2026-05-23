import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Business } from "@/lib/businesses";
import { fetchBusinessById } from "@/lib/businessService";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

function getRegion(countryCode?: string): "UK" | "US" {
  if (countryCode === "US") return "US";
  if (typeof window !== "undefined" && window.location.port === "3001") return "US";
  return "UK";
}

export default function ClaimBusinessPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadBusiness() {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        const result = await fetchBusinessById(businessId);
        if (!cancelled) setBusiness(result);
      } catch {
        if (!cancelled) setBusiness(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBusiness();
    return () => {
      cancelled = true;
    };
  }, [businessId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container-wide px-4 py-20 text-center">
          <h1 className="font-display text-4xl font-bold">Loading claim details</h1>
          <p className="mt-3 text-muted-foreground">Checking the listing before opening the claim form.</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business || !businessId) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main className="container-wide px-4 py-20 text-center">
          <h1 className="font-display text-4xl font-bold">Listing not found</h1>
          <p className="mt-3 text-muted-foreground">We could not find that business listing.</p>
          <Button className="mt-6" onClick={() => navigate("/claim-your-business")}>Claim another listing</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const region = getRegion(business.country_code);
  const isUS = region === "US";
  const listingUrl = typeof window !== "undefined" ? `${window.location.origin}/business/${businessId}` : `/business/${businessId}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`Claim ${business.name} | ${isUS ? "EmergencyContractors" : "EmergencyTradesmen"}`}
        description={`Submit a manual claim request for ${business.name}.`}
        canonical={`/business/claim/${businessId}`}
      />
      <Header />
      <main>
        <section className="business-owner-hero">
          <div className="container-wide business-owner-hero-grid">
            <div>
              <p className="business-owner-kicker">Manual claim request</p>
              <h1>Claim {business.name}</h1>
              <p className="business-owner-lede">
                Submit a claim request for this public listing. We review requests manually before any listing changes are made.
              </p>
              <p className="business-owner-copy">
                This does not grant instant access, verify ownership automatically, or change the live listing.
              </p>
              <Button asChild variant="outline" className="mt-6">
                <Link to={`/business/${businessId}`}>Back to listing</Link>
              </Button>
            </div>
            <div className="business-owner-panel">
              <div className="rounded-2xl border border-gold/20 bg-card p-6 shadow-xl">
                <div className="mb-4 flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10">
                    <Building className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">{business.name}</h2>
                    <p className="text-sm text-muted-foreground">{business.city || business.address || "Public listing"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <p>Admin may call the number already shown on the listing and check business-domain evidence before approving any future changes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container-wide px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <BusinessEnquiryForm
              region={region}
              defaultEnquiryType="Claim free listing"
              prefillBusinessName={business.name}
              prefillListingUrl={listingUrl}
            />
          </div>
        </section>
      </main>
      <Footer countryCode={isUS ? "US" : "GB"} />
    </div>
  );
}
