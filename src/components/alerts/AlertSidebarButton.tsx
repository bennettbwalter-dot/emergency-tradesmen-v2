import { Link, useLocation } from "react-router-dom";
import { Radar } from "lucide-react";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";
import { cn } from "@/lib/utils";

interface AlertSidebarButtonProps {
  className?: string;
  onNavigate?: () => void;
}

export function AlertSidebarButton({ className, onNavigate }: AlertSidebarButtonProps) {
  const location = useLocation();
  const { detectedTrade, detectedCity } = useChatbot();
  const { detectedCity: geoCity, detectedState } = useLocalization();
  const routeContext = getRouteAlertContext(location.pathname);
  const trade = routeContext.trade || detectedTrade || "";
  const city = routeContext.city || detectedCity || geoCity || "";
  const state = routeContext.state || detectedState || "";
  const params = new URLSearchParams();

  if (trade) params.set("trade", trade);
  if (city) params.set("city", titleize(city));
  if (state) params.set("state", titleize(state));

  const href = params.toString() ? `/alerts?${params.toString()}` : "/alerts";

  return (
    <Link
      to={href}
      onClick={onNavigate}
      className={cn(
        "home-search-nav-item border border-amber-400/20 bg-amber-400/8 shadow-[0_10px_30px_rgba(212,175,55,0.08)]",
        className,
      )}
    >
      <Radar className="h-4 w-4 shrink-0 text-gold" />
      Live Alerts
    </Link>
  );
}

function getRouteAlertContext(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const emergencyIndex = segments.findIndex((segment) => segment.startsWith("emergency-"));
  if (emergencyIndex >= 0) {
    return {
      trade: segments[emergencyIndex].replace("emergency-", "").replace("-near-me", ""),
      city: segments[emergencyIndex + 1],
      state: segments.length >= 3 && emergencyIndex > 0 ? segments[0] : "",
    };
  }

  if (segments.length >= 3) {
    const tradeSegment = segments[segments.length - 1];
    if (tradeSegment.startsWith("emergency-")) {
      return {
        trade: tradeSegment.replace("emergency-", "").replace("-near-me", ""),
        city: segments[segments.length - 2],
        state: segments[0],
      };
    }
  }

  return { trade: "", city: "", state: "" };
}

function titleize(value: string) {
  return decodeURIComponent(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

