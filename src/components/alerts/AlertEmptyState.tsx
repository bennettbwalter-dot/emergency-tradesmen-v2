import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AlertEmptyState() {
  return (
    <div className="rounded-lg border border-emerald-500/25 bg-emerald-50/80 p-5 text-slate-950 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-emerald-300/20 dark:bg-emerald-300/8 dark:text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-emerald-500 text-white shadow-[0_0_28px_rgba(16,185,129,0.28)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-xl font-black leading-tight">No current emergency alerts in this area.</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600 dark:text-white/68">
              You can still search for local emergency help if you need support now.
            </p>
          </div>
        </div>
        <Link
          to="/home#manual-search"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-gold hover:text-black dark:bg-white dark:text-slate-950"
        >
          Find Emergency Help
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
