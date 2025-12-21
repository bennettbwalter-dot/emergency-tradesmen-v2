import { Link } from "react-router-dom";
import { Mail, Star, MapPin, Phone, ShieldCheck, Zap, Heart, MessageSquareQuote, Factory, Wrench, TrendingUp, Clock, Key, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Business } from "@/lib/businesses";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";

interface BusinessCardProps {
  business: Business;
  rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

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

  // A business is "open" if it's 24h OR the hours string says "Open" and not "Closed"
  const isCurrentlyOpen = business.isOpen24Hours ||
    (business.hours &&
      business.hours.toLowerCase().includes("open") &&
      !business.hours.toLowerCase().includes("closed"));

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

  // Status Color Logic
  const statusColorClass = isCurrentlyOpen
    ? (isPremium ? "text-emerald-400" : "text-green-500")
    : "text-red-500";
  const statusBgClass = isCurrentlyOpen
    ? (isPremium ? "bg-emerald-500/10 border-emerald-500/40" : "bg-green-500/10 border-green-500/30")
    : "bg-red-500/10 border-red-500/30";
  const dotColorClass = isCurrentlyOpen
    ? (isPremium ? "bg-emerald-500" : "bg-green-500")
    : "bg-red-500";
  const dotPingClass = isCurrentlyOpen
    ? (isPremium ? "bg-emerald-400" : "bg-green-400")
    : "bg-red-400";

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

      {/* Header section with Featured Badge and rank placeholder */}
      <div className="p-6 pb-0 flex flex-col">
        {/* Top meta area (Badge/Rank/Favorite) - FIXED HEIGHT 40px */}
        <div className="flex items-center justify-between mb-4 h-10">
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">Featured</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-display text-gold text-sm font-bold">
                {rank}
              </div>
            )}
          </div>

          <button
            onClick={handleFavorite}
            className={`transition-colors duration-300 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-gold'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Brand Area (Logo/Verified) - FIXED HEIGHT 100px for Premium, Placeholder for Normal */}
        <div className="h-[100px] flex items-center mb-4">
          {isPremium ? (
            <div className="flex items-center gap-4 w-full">
              <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border bg-white shadow-[0_0_20px_rgba(16,185,129,0.1)] border-emerald-500/20 p-2">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-emerald-600">{getInitials(business.name)}</span>
                    <TradeIcon className="w-4 h-4 mt-1 text-emerald-500/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500/80" />
                  Verified Partner
                </div>
                <div className="text-emerald-400/80 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 w-fit">
                  {tradeName}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-gold/60 text-[11px] uppercase font-bold tracking-widest bg-gold/5 px-3 py-1 rounded border border-gold/10">
                {tradeName}
              </div>
            </div>
          )}
        </div>

        {/* Title Section - FIXED HEIGHT 60px to handle 2 lines */}
        <div className="h-[60px] flex items-start">
          <h3 className={`font-display tracking-tight leading-tight line-clamp-2 ${isPremium ? "text-[#D4AF37] text-2xl" : "text-xl text-foreground"}`}>
            <Link to={`/business/${business.id}`} className="hover:opacity-80 transition-opacity">
              {business.name}
            </Link>
          </h3>
        </div>
      </div>

      <div className="p-6 pt-2 flex-1 flex flex-col">
        {/* Statistics Row - FIXED HEIGHT 32px */}
        <div className="flex items-center justify-between mb-6 h-8">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isPremium ? "text-emerald-500 fill-emerald-500" : "text-gold fill-gold"}`} />
            <span className={`font-bold ${isPremium ? "text-gray-200" : "text-foreground"}`}>{business.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({business.reviewCount})</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusBgClass}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotPingClass}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColorClass}`}></span>
            </span>
            <span className={`text-[10px] font-bold tracking-widest ${statusColorClass}`}>
              AVAILABLE
            </span>
          </div>
        </div>

        {/* Details & Info - FLEX GROW */}
        <div className="flex-1">
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm h-5">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${isPremium ? "text-emerald-500/70" : "text-gold/70"}`} />
              <span className={`line-clamp-1 ${isPremium ? "text-gray-300 font-medium" : "text-muted-foreground"}`}>{business.address || "Serving your area"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm h-5">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isPremium ? "text-emerald-500/70" : "text-gold/70"}`} />
              <span className={`line-clamp-1 ${isPremium ? "text-gray-300 font-medium" : "text-muted-foreground"}`}>{business.hours || "24/7 Emergency Service"}</span>
            </div>

            {/* Premium Details - Shared Fixed Height Container to maintain alignment */}
            <div className="h-[75px] overflow-hidden">
              {isPremium ? (
                <>
                  {business.services_offered && business.services_offered.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {business.services_offered.slice(0, 2).map((service, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {service}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
                      <span className="text-[#D4AF37]/90 text-xs font-semibold uppercase tracking-wider">Verified Professional</span>
                    </div>
                  )}

                  {business.premium_description && (
                    <p className="text-[11px] text-gray-400 italic line-clamp-2 leading-relaxed mt-2 border-l-2 border-emerald-500/30 pl-3">
                      "{business.premium_description}"
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 opacity-40">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold/30" />
                    <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Local Pro</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - FIXED FOOTER */}
        <div className="mt-auto pt-6 border-t border-border/30 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              asChild
              className={`h-11 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${isPremium
                ? "bg-gradient-to-r from-[#10B981] to-[#059669] hover:brightness-110 text-white border border-emerald-400/30"
                : "bg-gold hover:bg-yellow-500 text-black border-0"
                }`}
            >
              <a href={`tel:${business.phone}`} onClick={() => trackEvent("Business", "Call Now", business.name)} className="flex items-center justify-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                Call
              </a>
            </Button>

            <Button
              asChild
              className={`h-11 text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${isPremium
                ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30"
                }`}
            >
              <a
                href={`https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
                className="flex items-center justify-center gap-2"
              >
                <div className="w-3.5 h-3.5 border-2 border-current rounded-full flex items-center justify-center font-bold text-[8px]">W</div>
                WhatsApp
              </a>
            </Button>
          </div>

          {/* Website Button Slot - ALWAYS RESERVES 40px HEIGHT */}
          <div className="h-10">
            {business.website ? (
              <Button
                asChild
                variant="outline"
                className={`w-full h-full text-[10px] font-bold uppercase tracking-widest transition-all ${isPremium
                  ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                  : "border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Business", "Website Click", business.name)}
                  className="flex items-center justify-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5" />
                  Visit Website
                </a>
              </Button>
            ) : (
              <div className="w-full h-full border border-dashed border-border/30 rounded-md flex items-center justify-center opacity-30">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Verified Listing</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
