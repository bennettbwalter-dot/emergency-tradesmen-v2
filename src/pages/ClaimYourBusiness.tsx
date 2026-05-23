import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { BusinessEnquiryForm } from "@/components/business/BusinessEnquiryForm";

function getRegion(): "UK" | "US" {
  if (typeof window === "undefined") return "UK";
  const host = window.location.hostname;
  const port = window.location.port;
  return host.includes("emergencycontractors.net") || port === "3001" ? "US" : "UK";
}

export default function ClaimYourBusiness() {
  const region = getRegion();
  const isUS = region === "US";
  const brand = isUS ? "EmergencyContractors" : "EmergencyTradesmen";
  const representativeWord = isUS ? "authorized" : "authorised";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`Claim Your Business Listing | ${brand}`}
        description={`Submit a manual claim request for a business listing on ${brand}.`}
        canonical="/claim-your-business"
      />
      <Header />
      <main>
        <section className="business-owner-hero">
          <div className="container-wide business-owner-hero-grid">
            <div>
              <p className="business-owner-kicker">Claim request only</p>
              <h1>Claim Your Business Listing</h1>
              <p className="business-owner-lede">
                Submit a claim request so we can manually review whether you own, work for, or are {representativeWord} to represent the business.
              </p>
              <p className="business-owner-copy">
                Claiming does not instantly edit a listing, verify ownership, or grant account access. We review requests manually before any listing changes are made.
              </p>
            </div>
            <div className="business-owner-panel">
              <div className="business-claim-checklist">
                <h2>Manual checks may include</h2>
                <ul>
                  <li>Calling the number already shown on the listing</li>
                  <li>Checking the business website contact details</li>
                  <li>Reviewing email domain and public business profiles</li>
                  <li>Recording admin notes before changes are approved</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="container-wide px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="font-display text-4xl font-semibold">Submit Your Claim</h2>
              <p className="mt-3 text-muted-foreground">Use the listing URL field if you know the exact profile page.</p>
            </div>
            <BusinessEnquiryForm region={region} defaultEnquiryType="Claim free listing" />
          </div>
        </section>
      </main>
      <Footer countryCode={isUS ? "US" : "GB"} />
    </div>
  );
}
