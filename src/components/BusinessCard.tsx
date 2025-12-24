import { Link } from "react-router-dom";
import { Mail, Star, MapPin, Phone, ShieldCheck, Zap, Heart, MessageSquareQuote, Factory, Wrench, TrendingUp, Clock, Key, Globe, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthModal } from "./AuthModal";
import { Business, isBusinessAvailable } from "@/lib/businesses";
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

  // Availability Logic - Centralized
  const isLive = isBusinessAvailable(business);
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

  // Status Color Logic: Green for ON, Red for OFF
  const statusColorClass = isLive ? "text-green-500" : "text-red-500";
  const statusBgClass = isLive ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30";
  const dotColorClass = isLive ? "bg-green-500" : "bg-red-500";
  const dotPingClass = isLive ? "bg-green-400" : "hidden";

  // Dynamic Background Logic
  const bgIndex = business.id ? Array.from(business.id).reduce((acc, char) => acc + char.charCodeAt(0), 0) % 5 : 0;
  const bgUrl = `/backgrounds/card-bg-${bgIndex}.png`;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-500 overflow-hidden h-full flex flex-col ${isPremium
        ? "bg-emerald-50/50 border-emerald-200 shadow-[0_8px_30px_rgb(16,185,129,0.1)] ring-1 ring-emerald-500/10 hover:border-gold hover:border-2"
        : "bg-white border-slate-200 shadow-sm hover:border-gold hover:border-2 hover:shadow-xl hover:shadow-gold/10 hover:-translate-y-1"
        }`}
    >
      {/* Dynamic Background Image */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: `url(${bgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: isPremium ? 0.05 : 0.8,
          mixBlendMode: isPremium ? 'multiply' : 'normal'
        }}
      />

      {/* Background Marble/Grain Texture Overlay (Premium Only) */}
      {isPremium && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')] mix-blend-overlay z-1" />
      )}

      {/* Header section with Featured Badge and rank placeholder */}
      <div className="relative z-10 p-6 pb-0 flex flex-col">
        {/* Top meta area (Badge/Rank/Favorite) - FIXED HEIGHT 40px */}
        <div className="flex items-center justify-between mb-4 h-10">
          <div className="flex items-center gap-3">
            {isPremium ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 shadow-sm">
                <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">Premium Partner</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center font-display text-gold text-sm font-bold">
                {rank}
              </div>
            )}
          </div>

          <button
            onClick={handleFavorite}
            className={`transition-colors duration-300 ${liked ? 'text-red-500' : 'text-slate-400 hover:text-gold'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Brand Area (Logo/Verified) - FIXED HEIGHT 100px for Premium, Placeholder for Normal */}
        <div className="h-[100px] flex items-center mb-4">
          {isPremium ? (
            <div className="flex items-center gap-4 w-full bg-white/60 backdrop-blur-sm p-3 rounded-xl border border-white/50">
              <div className="w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border bg-white shadow-sm border-emerald-100">
                {business.logo_url ? (
                  <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" loading="lazy" width="80" height="80" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-emerald-600">{getInitials(business.name)}</span>
                    <TradeIcon className="w-4 h-4 mt-1 text-emerald-500/50" />
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Verified Business
                </div>
                <div className="text-emerald-700 text-[10px] uppercase font-bold tracking-widest bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 w-fit">
                  {tradeName}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/50">
              <div className="text-gold text-[11px] uppercase font-bold tracking-widest bg-gold/5 px-3 py-1 rounded border border-gold/20">
                {tradeName}
              </div>
            </div>
          )}
        </div>

        {/* Title Section - Handles 2 lines + profile link */}
        <div className="min-h-[90px] flex flex-col items-start bg-white/95 p-4 rounded-xl border border-slate-200 shadow-sm">
          <h3 className={`font-display tracking-tight leading-tight line-clamp-2 text-slate-900 ${isPremium ? "text-2xl font-black" : "text-xl font-bold"}`}>
            <Link to={`/business/${business.id}`} className="hover:text-gold transition-colors block">
              {business.name}
            </Link>
          </h3>
          <Link
            to={`/business/${business.id}`}
            className={`text-[10px] font-extrabold uppercase tracking-widest mt-2 flex items-center gap-1 transition-all group-hover:translate-x-1 ${isPremium ? "text-emerald-700 hover:text-emerald-900" : "text-gold hover:text-yellow-600"}`}
          >
            View Full Profile
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="relative z-10 p-6 pt-2 flex-1 flex flex-col bg-white/40 backdrop-blur-sm mt-2 rounded-t-3xl border-t border-white/60">
        {/* Statistics Row - FIXED HEIGHT 32px */}
        <div className="flex items-center justify-between mb-6 h-8">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isPremium ? "text-emerald-600 fill-emerald-600" : "text-gold fill-gold"}`} />
            <span className="font-black text-slate-900">{business.rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500 font-bold">({business.reviewCount} reviews)</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm ${statusBgClass}`}>
            <span className="relative flex h-1.5 w-1.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotPingClass}`}></span>
              <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColorClass}`}></span>
            </span>
            <span className={`text-[10px] font-black tracking-widest ${statusColorClass}`}>
              {isLive ? "AVAILABLE NOW" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Details & Info - FLEX GROW */}
        <div className="flex-1">
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm h-5">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${isPremium ? "text-emerald-600" : "text-gold"}`} />
              <span className="line-clamp-1 text-slate-700 font-bold">{business.address || "Serving London & Surrounding"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm h-5">
              <Clock className={`w-4 h-4 flex-shrink-0 ${isPremium ? "text-emerald-600" : "text-gold"}`} />
              <span className="line-clamp-1 text-slate-700 font-bold">{business.hours || "24/7 Emergency Response"}</span>
            </div>

            {/* Premium Details - Shared Fixed Height Container to maintain alignment */}
            <div className="h-[75px] overflow-hidden">
              {isPremium ? (
                <>
                  {business.services_offered && business.services_offered.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {business.services_offered.slice(0, 2).map((service, i) => (
                        <div key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 border border-emerald-200 text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {service}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-sm mt-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider">Verified Professional</span>
                    </div>
                  )}

                  {business.premium_description && (
                    <p className="text-[11px] text-slate-600 font-medium italic line-clamp-2 leading-relaxed mt-2 border-l-2 border-emerald-200 pl-3">
                      "{business.premium_description}"
                    </p>
                  )}
                </>
              ) : (
                <div className="mt-4 opacity-70">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Tradesperson</span>
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
              className={`h-11 text-[11px] font-black tracking-widest uppercase transition-all duration-300 shadow-md ${isPremium
                ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-0"
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
              className={`h-11 text-[11px] font-black tracking-widest uppercase transition-all duration-300 shadow-sm ${isPremium
                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-green-50 hover:bg-green-100 text-green-700 border border-green-200"
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

          <div className="h-10">
            {business.website ? (
              <Button
                asChild
                variant="outline"
                className={`w-full h-full text-[10px] font-black uppercase tracking-widest transition-all ${isPremium
                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
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
