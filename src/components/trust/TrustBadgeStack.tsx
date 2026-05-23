import { Building2, Globe2, Phone, Radio, ShieldCheck, UserCheck } from "lucide-react";
import { Business } from "@/lib/businesses";
import { cn } from "@/lib/utils";
import { getTrustBadgesForBusiness, type TrustBadgeId } from "@/lib/trust/trustBadges";
import { TrustBadgeTooltip } from "@/components/trust/TrustBadgeTooltip";

const badgeIcons: Record<TrustBadgeId, typeof Phone> = {
  phone_present: Phone,
  website_checked: Globe2,
  owner_claimed: UserCheck,
  companies_house_active: Building2,
  registry_checked: ShieldCheck,
  response_tracking_enabled: Radio,
};

interface TrustBadgeStackProps {
  business: Business;
  className?: string;
  compact?: boolean;
}

export function TrustBadgeStack({ business, className, compact = false }: TrustBadgeStackProps) {
  const badges = getTrustBadgesForBusiness(business, business.field_evidence || []);

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label="Listing evidence">
      {badges.map((badge) => {
        const Icon = badgeIcons[badge.id];

        return (
          <TrustBadgeTooltip key={badge.id} badge={badge}>
            <span
              className={cn(
                "inline-flex max-w-full items-center gap-1.5 rounded border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 transition-all duration-300 cursor-help hover:scale-[1.03] hover:bg-emerald-500/15 hover:border-emerald-500/45 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]",
                "dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:hover:bg-emerald-400/15 dark:hover:border-emerald-400/45 dark:hover:shadow-[0_0_12px_rgba(52,211,153,0.2)]",
                compact && "px-1.5 py-0.5 text-[9px]",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{badge.label}</span>
            </span>
          </TrustBadgeTooltip>
        );
      })}
    </div>
  );
}
