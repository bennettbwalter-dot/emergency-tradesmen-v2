import { CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Business, getListingDisplayStatus, getListingStatusLabel } from "@/lib/businesses";
import { cn } from "@/lib/utils";

interface ListingStatusBadgeProps {
  business?: Business | null;
  className?: string;
}

export function ListingStatusBadge({ business, className }: ListingStatusBadgeProps) {
  const status = getListingDisplayStatus(business);
  const label = getListingStatusLabel(status);
  const Icon = status === 'verified' ? ShieldCheck : status === 'claimed' ? CheckCircle2 : FileText;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
        status === 'verified' && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
        status === 'claimed' && "border-blue-500/30 bg-blue-500/10 text-blue-600",
        status === 'public_unclaimed' && "border-amber-500/30 bg-amber-500/10 text-amber-700",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
