import { Link } from "react-router-dom";
import { Mail, Star, MapPin, Phone, ShieldCheck, Zap, Heart, MessageSquareQuote, Factory, Wrench, TrendingUp, Clock, Key, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Business } from "@/lib/businesses";
import { useComparison } from "@/contexts/ComparisonContext";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";

interface BusinessCardProps {
  business: Business;
  rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const { toast } = useToast();

  const inComparison = isInComparison(business.id);

  // Trade Icon Logic
  let TradeIcon = Wrench;
  if (business.trade === 'electrician') TradeIcon = Zap;
  else if (business.trade === 'plumber') TradeIcon = Wrench;
  else if (business.trade === 'locksmith') TradeIcon = Key;
  else if (business.trade === 'glazier') TradeIcon = Factory;

  const tradeName = business.trade ? business.trade.charAt(0).toUpperCase() + business.trade.slice(1) : "Tradesperson";

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setLiked(!liked);
  };

  // Availability Logic
  const lastPing = business.last_available_ping ? new Date(business.last_available_ping) : null;
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const isLive = lastPing && lastPing > oneHourAgo;
  const isAvailable = true; // Default for emergency trades
  const showAvailable = isLive || business.isOpen24Hours || isAvailable;

  const isPremium = business.is_premium || business.tier === 'paid' || (business.priority_score && business.priority_score > 0);

  // Logo Placeholder Logic
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-500 overflow-hidden h-full flex flex-col ${isPremium
        ? "bg-[#0A1A14] border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20"
        : "bg-card border-border/50 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-1"
        }`}
    >
      {/* Background Marble/Grain Texture Overlay (Premium Only) */}
      {isPremium && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')] mix-blend-overlay" />
      )}

      {/* Header section with Featured Badge and Logo */}
      <div className="relative p-6 pb-0">
        <div className="flex items-start justify-between mb-4">
          {/* Featured Badge / Rank Badge */}
          {isPremium ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Featured</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-display text-gold text-sm font-bold">
                {rank}
              </div>
              <h3 className="font-display text-xl tracking-tight leading-none text-foreground">
                <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors">
                  {business.name}
                </Link>
              </h3>
            </div>
          )}

          {/* Favorite heart icon */}
          <button
            onClick={handleFavorite}
            className={`transition-colors duration-300 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-gold'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Business Hero (Logo + Name) - ONLY FOR PREMIUM */}
        {isPremium && (
          <div className="flex flex-col items-start gap-5 mt-2">
            {/* Logo Placeholder / Image */}
            <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border transition-all duration-300 bg-white shadow-[0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20 p-2">
              {business.logo_url ? (
                <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-emerald-600">
                    {getInitials(business.name)}
                  </span>
                  <TradeIcon className="w-4 h-4 mt-1 text-emerald-500/50" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/80" />
                Verified Partner
              </div>
              <h3 className="font-display tracking-tight leading-tight line-clamp-2 text-[#D4AF37] text-2xl">
                <Link to={`/business/${business.id}`} className="hover:opacity-80 transition-opacity">
                  {business.name}
                </Link>
              </h3>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Rating and Availability Row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isPremium ? "text-emerald-500 fill-emerald-500" : "text-gold fill-gold"}`} />
            <span className={`font-bold ${isPremium ? "text-gray-200" : "text-foreground"}`}>{business.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({business.reviewCount} reviews)</span>
          </div>

          {showAvailable && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isPremium
              ? "bg-emerald-500/10 border-emerald-500/40"
              : "bg-green-500/10 border-green-500/30"
              }`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className={`text-[11px] font-bold tracking-widest ${isPremium ? "text-emerald-400" : "text-green-500"}`}>
                AVAILABLE NOW
              </span>
            </div>
          )}
        </div>

        {/* Details List */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-sm">
            <MapPin className={`w-4 h-4 ${isPremium ? "text-emerald-500/70" : "text-gold/70"}`} />
            <span className={isPremium ? "text-gray-300 font-medium" : "text-muted-foreground"}>{business.address || "Serving your area"}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className={`w-4 h-4 ${isPremium ? "text-emerald-500/70" : "text-gold/70"}`} />
            <span className={isPremium ? "text-gray-300 font-medium" : "text-muted-foreground"}>{business.hours || "24/7 Emergency Service"}</span>
          </div>

          {/* Dynamic Premium Details */}
          {isPremium && (
            <>
              {business.services_offered && business.services_offered.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-4">
                  {business.services_offered.slice(0, 3).map((service, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      {service}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                  <span className="text-[#D4AF37]/90 font-semibold tracking-wide">Verified Professional</span>
                </div>
              )}

              {business.premium_description && (
                <p className="text-xs text-gray-400 italic line-clamp-2 leading-relaxed mt-2 border-l-2 border-emerald-500/30 pl-3">
                  "{business.premium_description}"
                </p>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
          {/* Call Now Button */}
          <Button
            asChild
            className={`w-full h-12 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${isPremium
              ? "bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white border border-[#D4AF37]/50 shadow-lg shadow-emerald-500/20"
              : "bg-gradient-to-r from-gold to-yellow-500 hover:from-yellow-400 hover:to-gold text-black border-0 shadow-md"
              }`}
          >
            <a href={`tel:${business.phone}`} onClick={() => trackEvent("Business", "Call Now", business.name)} className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </Button>

          {/* WhatsApp Button */}
          <Button
            asChild
            className={`w-full h-12 text-sm font-bold tracking-widest uppercase transition-all duration-300 ${isPremium
              ? "bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 text-emerald-400 border border-emerald-500/50"
              : "bg-green-500 hover:bg-green-600 text-white shadow-sm"
              }`}
          >
            <a
              href={`https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
              className="flex items-center justify-center gap-2"
            >
              <MessageSquareQuote className="w-4 h-4" />
              WhatsApp Now
            </a>
          </Button>

          {/* Website Button */}
          {business.website && (
            <Button
              asChild
              variant="outline"
              className={`w-full h-10 text-xs font-bold uppercase tracking-widest transition-all ${isPremium
                ? "border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                : "border-blue-500/30 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
            >
              <a
                href={business.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Business", "Website Click", business.name)}
                className="flex items-center justify-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            </Button>
          )}

          {/* Compare Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (inComparison) removeFromComparison(business.id);
              else addToComparison(business.id);
              toast({ title: inComparison ? "Removed from comparison" : "Added to comparison" });
            }}
            className={`w-full py-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${isPremium
              ? "text-[#D4AF37] border border-[#D4AF37]/30 rounded-lg hover:bg-[#D4AF37]/10 mt-2"
              : "text-muted-foreground hover:text-gold border border-border/30 rounded-lg hover:border-gold/30 mt-2"
              }`}
          >
            <TrendingUp className="w-3 h-3" />
            {inComparison ? 'In Comparison' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
}
