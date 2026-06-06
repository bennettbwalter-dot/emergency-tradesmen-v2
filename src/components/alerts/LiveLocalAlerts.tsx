import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ArrowRight, Loader2, LocateFixed, Radar, RefreshCw, Satellite } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/contexts/LocalizationContext";
import type { LiveAlertsResponse } from "@/lib/alerts/types";
import { getAlertTradeSlugs } from "@/lib/alerts/matchAlertToTrade";
import { cn } from "@/lib/utils";
import { AlertCard } from "./AlertCard";
import { AlertEmptyState } from "./AlertEmptyState";
import { AlertErrorState } from "./AlertErrorState";

interface LiveLocalAlertsProps {
  className?: string;
  compact?: boolean;
  variant?: "full" | "preview";
  city?: string | null;
  stateName?: string | null;
  tradeSlug?: string | null;
  title?: string;
  description?: string;
}

export function LiveLocalAlerts({
  className,
  compact = false,
  variant = "full",
  city,
  stateName,
  tradeSlug,
  title = "Live Local Alerts",
  description,
}: LiveLocalAlertsProps) {
  const {
    settings,
    userCoords,
    detectedCity,
    detectedState,
    detectUserLocation,
    isLocating,
  } = useLocalization();
  const [data, setData] = useState<LiveAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const requestUrl = useMemo(() => {
    const params = new URLSearchParams({ country: settings.countryCode });
    const activeCity = city || detectedCity;
    const activeState = stateName || detectedState;
    if (activeCity) params.set("city", activeCity);
    if (activeState) params.set("state", activeState);
    if (userCoords) {
      params.set("lat", String(userCoords.latitude));
      params.set("lng", String(userCoords.longitude));
    }
    return `/api/live-alerts?${params.toString()}`;
  }, [city, detectedCity, detectedState, settings.countryCode, stateName, userCoords]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    fetch(requestUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Alert endpoint failed");
        return response.json() as Promise<LiveAlertsResponse>;
      })
      .then((payload) => {
        setData(payload);
        setError(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        console.warn("[LiveLocalAlerts] failed", err);
        setError(true);
        setData(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestUrl, refreshIndex]);

  const locationLabel = city || detectedCity || stateName || detectedState || data?.locationLabel || (settings.countryCode === "US" ? "United States" : "United Kingdom");
  const filteredAlerts = useMemo(() => {
    const alerts = data?.alerts || [];
    if (!tradeSlug) return alerts;
    return alerts.filter((alert) => getAlertTradeSlugs(alert, settings.countryCode).includes(tradeSlug));
  }, [data?.alerts, settings.countryCode, tradeSlug]);
  const visibleAlerts = variant === "preview" ? filteredAlerts.slice(0, 2) : filteredAlerts;
  const hasAlerts = visibleAlerts.length > 0;
  const intro = description || (
    tradeSlug
      ? `Official warnings for ${locationLabel}, filtered for this service so you can act quickly.`
      : `Current warnings from official sources for ${locationLabel}, matched to the emergency trade most likely to help.`
  );

  return (
    <section className={cn("relative isolate overflow-hidden py-12 sm:py-16", compact && "py-8 sm:py-10", variant === "preview" && "py-8 sm:py-10", className)}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(248,250,252,0.2)),radial-gradient(circle_at_18%_8%,rgba(20,184,166,0.14),transparent_30rem),radial-gradient(circle_at_85%_0%,rgba(212,175,55,0.16),transparent_26rem)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0)),radial-gradient(circle_at_18%_8%,rgba(20,184,166,0.14),transparent_30rem),radial-gradient(circle_at_85%_0%,rgba(212,175,55,0.18),transparent_26rem)]" />
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "rounded-lg border border-slate-950/10 bg-white/56 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#05070b]/72 dark:shadow-[0_34px_110px_rgba(0,0,0,0.42)] sm:p-5",
          variant === "preview" && "bg-white/72 dark:bg-[#070b12]/86"
        )}>
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_auto] xl:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-slate-950/10 bg-white/74 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-600 dark:border-white/10 dark:bg-white/8 dark:text-white/64">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Official live feeds
              </div>
              <h2 className={cn("mt-4 font-display font-black leading-[0.98] tracking-normal text-slate-950 dark:text-white", variant === "preview" ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl")}>
                {title}
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-slate-600 dark:text-white/66">
                {intro}
              </p>
            </div>

            {variant === "preview" ? (
              <Link
                to="/alerts"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-gold hover:text-black dark:bg-white dark:text-slate-950 dark:hover:bg-gold xl:min-w-[14rem]"
              >
                Open Live Alerts
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
            <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[25rem]">
              <Button
                type="button"
                onClick={detectUserLocation}
                disabled={isLocating}
                className="min-h-11 rounded-lg bg-slate-950 font-black text-white hover:bg-gold hover:text-black dark:bg-white dark:text-slate-950 dark:hover:bg-gold"
              >
                {isLocating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LocateFixed className="mr-2 h-4 w-4" />}
                Locate Me
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefreshIndex((value) => value + 1)}
                disabled={loading}
                className="min-h-11 rounded-lg border-slate-950/10 bg-white/72 font-black text-slate-950 hover:border-gold/50 hover:bg-white dark:border-white/12 dark:bg-white/6 dark:text-white dark:hover:bg-white/10"
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
              </Button>
            </div>
            )}
          </div>

          {variant === "preview" ? (
            <div className="mt-5 flex flex-wrap gap-2 border-y border-slate-950/10 py-3 dark:border-white/10">
              {(settings.countryCode === "US" ? ["NWS", "FEMA", "CPSC"] : ["Met Office", "Environment Agency", "National Highways"]).map((source) => (
                <span
                  key={source}
                  className="inline-flex items-center rounded-lg border border-slate-950/10 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-600 dark:border-white/10 dark:bg-white/8 dark:text-white/62"
                >
                  {source}
                </span>
              ))}
            </div>
          ) : (
          <div className="mt-5 grid gap-3 border-y border-slate-950/10 py-3 dark:border-white/10 sm:grid-cols-3">
            <StatusMetric icon={<Radar className="h-4 w-4" />} label="Coverage" value={settings.countryCode === "US" ? "NWS, FEMA, CPSC" : "Met Office, EA, Highways"} />
            <StatusMetric icon={<Satellite className="h-4 w-4" />} label="Area" value={locationLabel} />
            <StatusMetric
              icon={<RefreshCw className="h-4 w-4" />}
              label="Last checked"
              value={data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : loading ? "Checking" : "Unavailable"}
            />
          </div>
          )}

          <div className={cn("mt-5 space-y-4", variant === "preview" && "mt-4")}>
            {(error || data?.partialFailure) && <AlertErrorState />}

            {loading && (
              <div className={cn("grid gap-4", variant === "preview" ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3")}>
                {(variant === "preview" ? [0, 1] : [0, 1, 2]).map((item) => (
                  <div key={item} className={cn("animate-pulse rounded-lg border border-slate-950/10 bg-white/72 dark:border-white/10 dark:bg-white/6", variant === "preview" ? "min-h-[10rem]" : "min-h-[18rem]")} />
                ))}
              </div>
            )}

            {!loading && !error && !hasAlerts && <AlertEmptyState />}

            {!loading && hasAlerts && (
              <div className={cn("grid gap-4", variant === "preview" ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3")}>
                {visibleAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} country={settings.countryCode} city={city || detectedCity} compact={variant === "preview"} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg bg-white/62 px-3 py-2.5 text-slate-950 dark:bg-white/[0.055] dark:text-white">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-slate-950 text-gold dark:bg-white/10">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-white/42">{label}</span>
        <span className="block truncate text-sm font-black">{value}</span>
      </span>
    </div>
  );
}
