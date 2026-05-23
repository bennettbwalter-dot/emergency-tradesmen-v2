import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { type Trade, cities, usCities } from "@/lib/trades";
import { motion } from "framer-motion";
import { useChatbot } from "@/contexts/ChatbotContext";
import { useLocalization } from "@/contexts/LocalizationContext";

interface TradeCardProps {
  trade: Trade;
  city?: string;
}

export function TradeCard({ trade, city }: TradeCardProps) {
  const navigate = useNavigate();
  const { settings, detectedCity: localizationCity, detectUserLocation } = useLocalization();
  const { detectedCity: chatbotCity, setDetectedTrade, setDetectedCity } = useChatbot();

  // Priority: explicit prop > chatbot detection > localization auto-detect
  const targetCity = city || chatbotCity || localizationCity;
  const tradeName = settings.countryCode === 'US' ? (trade as any).usName : trade.name;
  const countryCities = settings.countryCode === 'US' ? usCities : cities;
  const isTargetCityValidForCountry = targetCity && countryCities.some(c => c.toLowerCase() === targetCity.toLowerCase());
  const targetPath = `/emergency-${trade.slug}${isTargetCityValidForCountry ? `/${targetCity.toLowerCase().replace(/\s+/g, '-')}` : ''}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Set the trade in context
    setDetectedTrade(trade.slug);

    // If we already have a city, navigate immediately
    // BUT only if the city is valid for the current country!
    if (targetCity && isTargetCityValidForCountry) {
      navigate(targetPath);
    } else {
      // If city is not valid for this country (e.g. Luton in US), clear context and get location
      if (targetCity) setDetectedCity("");
      detectUserLocation();
    }
  };

  // Removed the aggressive useEffect that was poisoning the global chatbot context
  // based on geolocation. Geolocation results should only be suggested or used
  // for initial navigation, not forced into the state on every card mount.

  return (
    <Link
      to={targetPath}
      onClick={handleClick}
      className="block h-full group relative"
    >
      <div className="relative h-full overflow-hidden rounded-2xl bg-card border border-white/10 shadow-lg transition-all duration-500 hover:shadow-[0_0_30px_-5px_hsl(var(--gold)/0.2)] hover:border-gold/30 hover:-translate-y-2">


        {/* Animated Shine Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shine" />
        </div>

        {/* Image / Icon Area */}
        <div className="relative aspect-[16/10] overflow-hidden bg-black/40 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity duration-500 group-hover:opacity-90" />

          {trade.image ? (
            <img
              src={trade.image}
              alt={`Emergency ${trade.name}`}
              className="w-full h-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30">
              <span className="text-5xl opacity-50 contrast-0 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500">
                {trade.icon}
              </span>
            </div>
          )}

          {/* Floating Icon - Glassmorphic */}
          {trade.vectorIcon && (
            <div className="absolute top-4 right-4 z-20 w-12 h-12 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl group-hover:scale-110 group-hover:border-gold/50 transition-all duration-300">
              <img src={trade.vectorIcon} alt={`${trade.name} icon`} loading="lazy" className="w-full h-full object-contain brightness-0 invert drop-shadow" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="relative z-20 p-6 flex flex-col items-start h-[180px]">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 backdrop-blur-md mb-4 group-hover:bg-gold/20 transition-colors">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
            </span>
            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">Available Now</span>
          </div>

          <h3 className="font-display font-bold text-2xl text-white group-hover:text-gold transition-colors duration-300 leading-none mb-2">
            Emergency <br /> {tradeName}
          </h3>

          <div className="mt-auto w-full pt-4 border-t border-white/10 flex items-center justify-between group/link">
            <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors uppercase tracking-wider">View Specialists</span>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:text-black transition-all duration-300 group-hover:scale-110">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
