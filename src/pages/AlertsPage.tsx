import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Radar } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { LiveLocalAlerts } from "@/components/alerts/LiveLocalAlerts";
import { useLocalization } from "@/contexts/LocalizationContext";

export default function AlertsPage() {
  const [searchParams] = useSearchParams();
  const { settings } = useLocalization();
  const city = searchParams.get("city");
  const stateName = searchParams.get("state");
  const tradeSlug = searchParams.get("trade");
  const locationLabel = city || stateName || (settings.countryCode === "US" ? "United States" : "United Kingdom");
  const siteName = settings.countryCode === "US" ? "Emergency Contractors" : "Emergency Tradesmen";

  return (
    <>
      <SEO
        title={`Live Local Emergency Alerts | ${siteName}`}
        description="Official local emergency alerts for weather, floods, traffic, safety recalls, and disaster updates matched to emergency trades and contractors."
        canonical="/alerts"
      />
      <Header countryCode={settings.countryCode} />
      <main className="min-h-screen bg-[#f8f7f2] text-slate-950 dark:bg-[#05070b] dark:text-white">
        <section className="relative overflow-hidden border-b border-slate-950/10 px-4 py-12 dark:border-white/10 sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(20,184,166,0.16),transparent_28rem),radial-gradient(circle_at_86%_5%,rgba(212,175,55,0.18),transparent_26rem)]" />
          <div className="relative mx-auto max-w-7xl">
            <Link
              to="/home#manual-search"
              className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-slate-500 transition hover:text-gold dark:text-white/54"
            >
              <ArrowLeft className="h-4 w-4" />
              Emergency search
            </Link>
            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-slate-950/10 bg-white/70 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-white/64">
                  <Radar className="h-4 w-4 text-gold" />
                  Official alert intelligence
                </div>
                <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] text-slate-950 dark:text-white sm:text-6xl">
                  Live Local Alerts
                </h1>
                <p className="mt-4 max-w-3xl text-lg font-semibold leading-relaxed text-slate-600 dark:text-white/66">
                  Official emergency feeds for {locationLabel}. Choose your area or use location to see what matters nearby.
                </p>
              </div>
              <div className="rounded-lg border border-slate-950/10 bg-white/78 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/7">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-gold dark:bg-white/10">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-white/44">Current view</p>
                    <p className="text-sm font-black">{locationLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <LiveLocalAlerts
          city={city}
          stateName={stateName}
          tradeSlug={tradeSlug}
          title={tradeSlug ? "Trade-Relevant Alerts" : "Live Local Alerts"}
          description={tradeSlug ? `Official alerts filtered for this emergency service around ${locationLabel}.` : undefined}
          className="pt-8"
        />
      </main>
      <Footer countryCode={settings.countryCode} />
    </>
  );
}

