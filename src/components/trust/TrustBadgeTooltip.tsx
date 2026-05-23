import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TrustBadge } from "@/lib/trust/trustBadges";

interface TrustBadgeTooltipProps {
  badge: TrustBadge;
  children: React.ReactNode;
}

export function TrustBadgeTooltip({ badge, children }: TrustBadgeTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-[260px] text-xs leading-relaxed">
        {badge.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
