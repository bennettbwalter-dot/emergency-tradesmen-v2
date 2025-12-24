import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { Trade } from "@/lib/trades";
import { motion } from "framer-motion";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useEffect } from "react";

interface TradeCardProps {
  trade: Trade;
  city?: string;
}

export function TradeCard({ trade, city }: TradeCardProps) {
  const navigate = useNavigate();
  const { detectedCity, setDetectedTrade, setDetectedCity } = useChatbot();
  const { getLocation, place } = useGeolocation();

  // If city is already detected from chatbot or props, use it
  const targetCity = city || detectedCity;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Set the trade in context
    setDetectedTrade(trade.slug);

    // If we already have a city, navigate immediately
    if (targetCity) {
      navigate(`/emergency-${trade.slug}/${targetCity.toLowerCase()}`);
    } else {
      // Otherwise, trigger location detection
      getLocation();
      // The navigation will happen via the SearchForm's auto-routing effect
    }
  };

  // Handle location result
  useEffect(() => {
    if (place?.city && !targetCity) {
      setDetectedCity(place.city);
      navigate(`/emergency-${trade.slug}/${place.city.toLowerCase()}`);
    }
  }, [place, targetCity, trade.slug, navigate, setDetectedCity]);

  return (
    <Link
      to={`/emergency-${trade.slug}/${targetCity ? targetCity.toLowerCase() : 'london'}`}
      onClick={handleClick}
      className="block"
    >
      <motion.div
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative flex flex-col rounded-lg border border-border/50 bg-card hover:border-gold hover:border-2 hover:shadow-xl hover:shadow-gold/5 transition-all duration-300 overflow-hidden h-full"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[1px] h-8 bg-gradient-to-b from-gold/50 to-transparent" />
          <div className="absolute top-0 right-0 w-8 h-[1px] bg-gradient-to-l from-gold/50 to-transparent" />
        </div>

        {/* Display Image if available, otherwise Icon */}
        {trade.image ? (
          <div className="relative w-full aspect-[2/3] overflow-hidden group-hover:shadow-lg transition-all duration-500 shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opactiy-90" />
            <motion.img
              src={trade.image}
              alt={`Emergency ${trade.name}`}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/3] flex items-center justify-center bg-card/50 shrink-0">
            <motion.span
              className="text-4xl block filter drop-shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
            >
              {trade.icon}
            </motion.span>
          </div>
        )}

        <div className="relative z-10 flex flex-col flex-grow p-4 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display text-xl text-foreground group-hover:text-gold transition-colors tracking-wide leading-tight min-h-[3.5rem] flex items-start flex-grow">
              Emergency {trade.name}
            </h3>
            {trade.vectorIcon && (
              <img
                src={trade.vectorIcon}
                alt=""
                className="w-8 h-8 md:w-10 md:h-10 object-contain brightness-110 group-hover:scale-110 transition-all duration-300 shrink-0"
              />
            )}
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 sm:pt-4 border-t border-border/30">
            <p className="text-[10px] sm:text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Available 24/7
            </p>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-border/50 flex items-center justify-center group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300 shrink-0 ml-2 sm:ml-4">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
