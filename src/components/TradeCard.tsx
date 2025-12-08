import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Trade } from "@/lib/trades";

interface TradeCardProps {
  trade: Trade;
  city?: string;
}

export function TradeCard({ trade, city = "manchester" }: TradeCardProps) {
  return (
    <Link
      to={`/emergency-${trade.slug}/${city.toLowerCase()}`}
      className="group block p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-lg hover:border-accent/50 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl mb-3 block">{trade.icon}</span>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-accent transition-colors">
            Emergency {trade.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Available 24/7 across the UK
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
