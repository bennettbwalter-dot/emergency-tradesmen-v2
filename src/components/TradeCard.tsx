import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Trade } from "@/lib/trades";
import { motion } from "framer-motion";

interface TradeCardProps {
  trade: Trade;
  city?: string;
}

export function TradeCard({ trade, city = "manchester" }: TradeCardProps) {
  return (
    <Link
      to={`/emergency-${trade.slug}/${city.toLowerCase()}`}
      className="block"
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative p-6 rounded-lg border border-border/50 bg-card hover:border-gold/40 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 overflow-hidden h-full"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-gold/50 to-transparent" />
          <div className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-gold/50 to-transparent" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <motion.span
              className="text-4xl mb-4 block filter drop-shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {trade.icon}
            </motion.span>
            <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-colors tracking-wide">
              Emergency {trade.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">
              Available 24/7
            </p>
          </div>
          <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}