import {
  AlertTriangle,
  ArrowRight,
  CloudSun,
  Car,
  ExternalLink,
  MapPin,
  PlugZap,
  ShieldAlert,
  Waves,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { AlertCategory, AlertCountry, LiveAlert } from "@/lib/alerts/types";
import { getAlertHelpTarget } from "@/lib/alerts/matchAlertToTrade";
import { cn } from "@/lib/utils";

interface AlertCardProps {
  alert: LiveAlert;
  country: AlertCountry;
  city?: string | null;
  compact?: boolean;
}

const severityStyles = {
  severe: "border-red-500/40 bg-red-500 text-white shadow-[0_0_24px_rgba(239,68,68,0.24)]",
  warning: "border-orange-500/40 bg-orange-500 text-white shadow-[0_0_24px_rgba(249,115,22,0.22)]",
  watch: "border-sky-500/35 bg-sky-500 text-white shadow-[0_0_24px_rgba(14,165,233,0.2)]",
  advisory: "border-gold/40 bg-gold text-black shadow-[0_0_24px_rgba(212,175,55,0.2)]",
  info: "border-slate-400/25 bg-slate-800 text-white dark:bg-white dark:text-slate-950",
};

const categoryStyles: Record<AlertCategory, string> = {
  weather: "text-sky-700 bg-sky-500/10 dark:text-sky-200",
  flood: "text-cyan-700 bg-cyan-500/10 dark:text-cyan-200",
  traffic: "text-orange-700 bg-orange-500/10 dark:text-orange-200",
  power: "text-yellow-700 bg-yellow-400/14 dark:text-yellow-100",
  recall: "text-rose-700 bg-rose-500/10 dark:text-rose-200",
  safety: "text-red-700 bg-red-500/10 dark:text-red-200",
  local: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-200",
};

export function AlertCard({ alert, country, city, compact = false }: AlertCardProps) {
  const help = getAlertHelpTarget(alert, country, city);
  const Icon = getCategoryIcon(alert.category);

  return (
    <article
      data-alert-card
      className={cn(
        "group relative overflow-hidden rounded-lg border border-slate-950/10 bg-white/86 text-slate-950 shadow-[0_18px_52px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-gold/45 hover:shadow-[0_26px_70px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-white/[0.055] dark:text-white dark:shadow-[0_20px_70px_rgba(0,0,0,0.32)]",
        compact ? "p-3" : "p-4"
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className={cn("inline-flex min-w-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-black uppercase tracking-[0.12em]", categoryStyles[alert.category])}>
          <Icon className="h-4 w-4 flex-none" />
          <span className="truncate">{alert.categoryLabel}</span>
        </div>
        <span className={cn("inline-flex flex-none items-center rounded-lg border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em]", severityStyles[alert.severity])}>
          {formatSeverity(alert.severity)}
        </span>
      </div>

      <h3 className={cn("font-display font-black leading-[1.02] text-slate-950 dark:text-white", compact ? "mt-3 line-clamp-2 text-lg" : "mt-4 text-2xl")}>
        {alert.title}
      </h3>
      <p className={cn("mt-3 text-sm font-semibold leading-relaxed text-slate-600 dark:text-white/68", compact && "line-clamp-2")}>
        {alert.summary}
      </p>

      <div className={cn("grid gap-2 text-xs font-bold text-slate-500 dark:text-white/54", compact ? "mt-3" : "mt-4")}>
        <span className="inline-flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 flex-none text-gold" />
          <span className="truncate">{alert.location}</span>
        </span>
        <span>
          {alert.sourceName} - updated {formatRelativeTime(alert.updatedAt)}
        </span>
      </div>

      <div className={cn("flex flex-col gap-2 sm:flex-row", compact ? "mt-4" : "mt-5")}>
        <Link
          to={help.href}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-gold hover:text-black dark:bg-white dark:text-slate-950 dark:hover:bg-gold",
            compact ? "min-h-10" : "min-h-11"
          )}
        >
          Find Help Now
          <ArrowRight className="h-4 w-4" />
        </Link>
        {alert.sourceUrl && !compact && (
          <a
            href={alert.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-950/10 px-4 text-sm font-black text-slate-700 transition hover:border-gold/50 hover:text-slate-950 dark:border-white/12 dark:text-white/72 dark:hover:text-white"
            aria-label={`Open ${alert.sourceName} source`}
          >
            Source
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>

      {!compact && (
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-white/36">
          Routes to {help.label}
        </p>
      )}
    </article>
  );
}

function getCategoryIcon(category: AlertCategory) {
  const icons: Record<AlertCategory, typeof AlertTriangle> = {
    weather: CloudSun,
    flood: Waves,
    traffic: Car,
    power: PlugZap,
    recall: ShieldAlert,
    safety: AlertTriangle,
    local: ShieldAlert,
  };
  return icons[category];
}

function formatSeverity(value: string) {
  if (value === "info") return "Info";
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  if (Number.isNaN(diffMs)) return "recently";

  const abs = Math.abs(diffMs);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["day", 86_400_000],
    ["hour", 3_600_000],
    ["minute", 60_000],
  ];
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (abs >= size) return formatter.format(Math.round(diffMs / size), unit);
  }
  return "just now";
}
