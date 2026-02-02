import { Link } from "react-router-dom";
import { Star, MapPin, Phone, ShieldCheck, Zap, Heart, Clock, Globe, CheckCircle, ArrowRight, Siren, Facebook, Instagram, Linkedin, Twitter, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Business, isBusinessAvailable } from "@/lib/businesses";
import { useToast } from "@/components/ui/use-toast";
import { trackEvent } from "@/lib/analytics";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import Squares from "@/components/ui/Squares";
import { useSimpleTheme } from "@/components/simple-theme";


interface BusinessCardProps {
  business: Business;
  rank: number;
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
  const { isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();
  const { theme } = useSimpleTheme();

  const tradeName = business.trade ? business.trade.toUpperCase() : "TRADESPERSON";
  const isLive = isBusinessAvailable(business);

  // Trust Score (1-5 Basis)
  const trustScore = business.trust_score || (() => {
    let score = 1; // Base point for being a service business
    if (business.email) score++;
    if (business.website) score++;
    if (business.reviewCount > 0) score++;
    if (business.social_links && Object.entries(business.social_links).some(([_, val]) => !!val)) score++;
    return score;
  })();

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setLiked(!liked);
  };

  return (
    <div className="relative w-full max-w-[22rem] mx-auto font-sans p-2">
      {/* === Main Card Container === */}
      {/* Light: White Glass | Dark: Deep Charcoal Glass */}
      <div className="absolute inset-0 -z-10 rounded-[2rem] overflow-hidden
          bg-white dark:bg-[#121212] border border-zinc-200 dark:border-white/10 shadow-lg dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]
      ">
        <Squares
          direction="diagonal"
          speed={0.2}
          squareSize={40}
          borderColor={theme === 'light' ? "#e4e4e7" : "rgba(255,255,255,0.5)"}
          hoverFillColor={theme === 'light' ? "#f4f4f5" : "#222222"}
          lineThickness={theme === 'light' ? 0.1 : 1}
          className="opacity-100"
        />

        {/* Dark Mode Overlays (Hidden in Light Mode) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2A2A2A] via-[#151515] to-[#050505] opacity-90 hidden dark:block pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-[50px] pointer-events-none hidden dark:block" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none hidden dark:block" />
      </div>

      <div className="relative z-10 flex flex-col gap-3 p-4 pt-5">

        {/* === 1. Header Row (Rank Badge + Heart) === */}
        <div className="flex items-center justify-between h-9 mb-1">
          {/* Brushed Metallic Gold Badge */}
          <div className="relative h-9 -ml-4 pl-5 pr-5 rounded-r-lg shadow-lg flex items-center gap-2 border-y border-[#FFE5B4]/30 shrink-0 overflow-hidden"
            style={{
              background: 'linear-gradient(90deg, #9C7C38 0%, #E5C576 40%, #BFA15F 60%, #856221 100%)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)'
            }}
          >
            {/* Metallic sheen overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            <span className="font-serif font-black text-[#1a1200] text-lg leading-none translate-y-[1px] drop-shadow-sm">#{rank}</span>
            <div className="w-[1px] h-4 bg-[#1a1200]/20" />
            <span className="text-[10px] font-bold text-[#1a1200] uppercase tracking-wide leading-none translate-y-[1px] drop-shadow-sm">Local Professionals</span>
          </div>

          {/* Heart */}
          <button onClick={handleFavorite} className="w-9 h-9 flex items-center justify-center text-zinc-400 dark:text-white/20 hover:text-red-500 transition-colors">
            <Heart className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`} strokeWidth={1.5} />
          </button>
        </div>

        {/* === 2. Category Tag (Fixed Height) - Translucent Dark Glass === */}
        <div className="flex justify-between items-center h-6">
          <span className="inline-flex items-center justify-center px-3 h-6 rounded bg-zinc-100 dark:bg-[#202020]/80 border border-zinc-200 dark:border-white/5 shadow-inner backdrop-blur-sm text-[9px] font-black tracking-[0.15em] text-zinc-600 dark:text-white/60 uppercase">
            {tradeName}
          </span>

          <HoverBorderGradient
            as={Link}
            to={`/business/${business.id}`}
            containerClassName="rounded-full h-6"
            className="h-full flex items-center px-3 bg-zinc-900 text-white gap-1"
            glowColor={theme === 'light' ? "#FFD700" : undefined}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider">View Profile</span>
            <ArrowRight className="w-3 h-3" />
          </HoverBorderGradient>
        </div>

        {/* === 3. Hero Section (Name + Verify) === */}
        <div className="group rounded-xl bg-black border border-zinc-800 dark:border-white/5 px-4 py-3 flex flex-col justify-center gap-3 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] min-h-[5.5rem] transition-colors hover:border-zinc-700">
          {/* Title - Elegant Serif */}
          <h3 className="font-serif text-[1.4rem] leading-tight text-white truncate pr-2 tracking-wide text-shadow-sm">
            <Link to={`/business/${business.id}`} className="hover:text-zinc-300 transition-colors">
              {business.name}
            </Link>
          </h3>

          {/* Sub-details */}
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 h-4">
            <div className="flex items-center gap-1 shrink-0">
              <ShieldCheck className={`w-3 h-3 ${trustScore >= 4 ? 'text-emerald-400' : 'text-blue-400'}`} />
              <span className={`${trustScore >= 4 ? 'text-emerald-400/90' : 'text-blue-400/90'}`}>Level {trustScore} Business</span>
            </div>
            <span className="opacity-30">•</span>
            <div className="flex items-center gap-1 shrink-0">
              <Siren className="w-3.5 h-3.5 text-red-500/80" />
              <span className="text-zinc-400">Emergency Specialist</span>
            </div>
          </div>
        </div>


        {/* === 4. Status Grid (Strict 50/50) === */}
        <div className="grid grid-cols-2 gap-2 h-10 w-full">
          {/* Rating - Solid Gold Pill */}
          <div className="flex items-center justify-center gap-2 h-full rounded-full border border-[#E5C576] dark:border-[#E5C576]/30 bg-[#FFF9EA] dark:bg-zinc-900 w-full shadow-sm">
            <Star className="w-3.5 h-3.5 text-[#F59E0B] dark:text-[#E5C576] fill-[#F59E0B] dark:fill-[#E5C576] shrink-0" />
            <span className="text-[#856221] dark:text-[#E5C576] font-bold text-sm leading-none translate-y-[1px]">{business.rating.toFixed(1)}</span>
            <span className="text-[#B49248] dark:text-[#BFA15F] text-[10px] leading-none translate-y-[1px]">({business.reviewCount})</span>
          </div>

          {/* Availability - Glowing Emerald */}
          <div className={`relative flex items-center justify-center gap-2 h-full rounded-full border overflow-hidden w-full transition-all
               ${isLive
              ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              : 'border-red-500/30 bg-red-50/50 dark:bg-red-900/10'
            }`}>
            <div className={`w-2 h-2 shrink-0 rounded-full ${isLive ? 'bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest leading-none translate-y-[1px] ${isLive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {isLive ? 'Available Now' : 'Offline'}
            </span>
            {isLive && <div className="absolute inset-0 bg-emerald-400/5 blur-md" />}
          </div>
        </div>

        {/* === 5. Info Stack (Dark Glass Pills with Gold Icons) === */}
        <div className="flex flex-col gap-1.5 w-full">
          {[
            { icon: MapPin, text: business.address || "Local Service Area" },
            { icon: Clock, text: business.hours || "24/7 Emergency Service" },
            { icon: ShieldCheck, text: `${trustScore}/5 Rating - Local Tradesperson` },
            { icon: Globe, text: business.website ? "Visit Website" : "No Website", href: business.website || undefined },
            // Add Email if present
            ...(business.email ? [{ icon: CheckCircle, text: "Verified Email Contact" }] : [])
          ].slice(0, 4).map((item: any, i) => {
            if (item.href) {
              return (
                <HoverBorderGradient
                  key={i}
                  as="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Business", "Website Click", business.name)}
                  containerClassName="rounded-full w-full h-11"
                  className="w-full h-full flex items-center justify-start px-5 bg-zinc-900 text-white"
                  glowColor={theme === 'light' ? "#FFD700" : undefined}
                >
                  <div className="w-5 flex justify-center shrink-0 mr-3">
                    <item.icon className="w-4 h-4 text-[#FFD700] dark:text-[#BFA15F]" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-white font-medium truncate w-full pt-[1px] tracking-wide">{item.text}</span>
                </HoverBorderGradient>
              );
            }

            const isNoWebsite = item.text === "No Website";
            const hiddenClass = isNoWebsite ? "opacity-0 pointer-events-none" : "";

            return (
              <div key={i} className={`relative group flex items-center h-11 w-full px-5 rounded-full border border-zinc-200 dark:border-white/5 bg-zinc-50/50 dark:bg-[#000]/40 backdrop-blur-sm shadow-sm transition-colors ${hiddenClass}`}>
                <div className="w-5 flex justify-center shrink-0 mr-3">
                  {/* Thin Elegant Gold Icons */}
                  <item.icon className="w-4 h-4 text-[#b49248] dark:text-[#BFA15F] opacity-80 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                </div>
                <span className="text-xs text-zinc-700 dark:text-white/80 font-medium truncate w-full pt-[1px] tracking-wide">{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* === 5.5 Social Icons (Hover Gradient) === */}
        <div className="flex justify-center gap-3 py-2 min-h-[40px]">
          {business.social_links?.facebook && (
            <HoverBorderGradient
              as="a"
              href={business.social_links.facebook}
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="rounded-full w-8 h-8 p-px"
              className="w-full h-full flex items-center justify-center bg-zinc-900 text-[#1877F2]"
              glowColor={theme === 'light' ? "#FFD700" : undefined}
            >
              <Facebook className="w-4 h-4" />
            </HoverBorderGradient>
          )}
          {business.social_links?.instagram && (
            <HoverBorderGradient
              as="a"
              href={business.social_links.instagram}
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="rounded-full w-8 h-8 p-px"
              className="w-full h-full flex items-center justify-center bg-zinc-900 text-[#E1306C]"
              glowColor={theme === 'light' ? "#FFD700" : undefined}
            >
              <Instagram className="w-4 h-4" />
            </HoverBorderGradient>
          )}
          {(business.social_links?.twitter) && (
            <HoverBorderGradient
              as="a"
              href={business.social_links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="rounded-full w-8 h-8 p-px"
              className="w-full h-full flex items-center justify-center bg-zinc-900 text-white"
              glowColor={theme === 'light' ? "#FFD700" : undefined}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </HoverBorderGradient>
          )}
          {business.social_links?.linkedin && (
            <HoverBorderGradient
              as="a"
              href={business.social_links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="rounded-full w-8 h-8 p-px"
              className="w-full h-full flex items-center justify-center bg-zinc-900 text-[#0077B5]"
              glowColor={theme === 'light' ? "#FFD700" : undefined}
            >
              <Linkedin className="w-4 h-4" />
            </HoverBorderGradient>
          )}
          {business.social_links?.tiktok && (
            <HoverBorderGradient
              as="a"
              href={business.social_links.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              containerClassName="rounded-full w-8 h-8 p-px"
              className="w-full h-full flex items-center justify-center bg-zinc-900 text-white"
              glowColor={theme === 'light' ? "#FFD700" : undefined}
            >
              <Video className="w-4 h-4" />
            </HoverBorderGradient>
          )}
        </div>

        {/* === 6. Buttons (Premium Finishes) === */}
        <div className="grid grid-cols-2 gap-2 mt-0.5 w-full h-11">
          {/* Call Button */}
          <HoverBorderGradient
            as="a"
            href={business.phone ? `tel:${business.phone}` : '#'}
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { if (!business.phone) e.preventDefault(); trackEvent("Business", "Call Now", business.name) }}
            containerClassName="rounded-lg w-full h-full"
            className="w-full h-full flex items-center justify-center bg-zinc-900 text-white"
            glowColor={theme === 'light' ? "#FFD700" : undefined}
          >
            <Phone className="w-4 h-4 mr-2" strokeWidth={2} />
            <span className="font-bold text-xs uppercase tracking-[0.15em] translate-y-[1px]">Call</span>
          </HoverBorderGradient>

          {/* WhatsApp Button */}
          <HoverBorderGradient
            as="a"
            href={`https://wa.me/${(business.whatsapp_number || business.phone || "").replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
            containerClassName="rounded-lg w-full h-full"
            className="w-full h-full flex items-center justify-center bg-emerald-600 text-white"
            glowColor={theme === 'light' ? "#FFD700" : undefined}
          >
            <div className="w-5 h-5 mr-2 border border-white/20 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-white/10">W</div>
            <span className="font-bold text-white text-xs uppercase tracking-[0.15em] translate-y-[1px]">WhatsApp</span>
          </HoverBorderGradient>
        </div>

        {/* === 7. Footer Pill (Glowing Blue Glass with Trust Score) === */}
        <div className="flex justify-center mt-2 relative z-20 h-7">
          <div className={`flex items-center gap-1.5 px-8 h-7 rounded-full bg-white/80 dark:bg-[#1e293b]/60 border shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:shadow-[0_0_20px_rgba(59,130,246,0.25)] relative overflow-hidden shrink-0 backdrop-blur-md transition-colors
               ${trustScore === 5 ? 'border-amber-400/40 shadow-amber-400/20' : 'border-blue-400/40 shadow-blue-400/20'}`}>

            {/* Blue/Gold sheen */}
            <div className={`absolute inset-0 bg-gradient-to-r opacity-50 ${trustScore === 5 ? 'from-amber-500/0 via-amber-500/10 to-amber-500/0' : 'from-blue-500/0 via-blue-500/10 to-blue-500/0'}`} />

            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg text-white shrink-0 z-10 box-decoration-clone
                  ${trustScore === 5 ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'}`}>
              <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] translate-y-[1px] text-shadow z-10 ${trustScore === 5 ? 'text-amber-800 dark:text-amber-100' : 'text-blue-800 dark:text-blue-100'}`}>
              {trustScore === 5 ? 'Top Rated 5/5' : `Verified ${trustScore}/5`}
            </span>
          </div>
        </div>



      </div>
    </div >
  );
}

// End of component
