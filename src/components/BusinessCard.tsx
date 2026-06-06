import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Heart, MapPin, Phone, Star } from "lucide-react";
import { Business, isBusinessAvailable } from "@/lib/businesses";
import { CardContainer } from "./business-card/CardContainer";
import { CardHeader } from "./business-card/CardHeader";
import { CardHero } from "./business-card/CardHero";
import { CardStatus } from "./business-card/CardStatus";
import { CardDetails } from "./business-card/CardDetails";
import { CardActions } from "./business-card/CardActions";
import { CardSocials } from "./business-card/CardSocials";
import { ListingStatusBadge } from "./ListingStatusBadge";
import { ClaimListingModal } from "./claims/ClaimListingModal";
import { TrustBadgeStack } from "./trust/TrustBadgeStack";
import { QuoteRequestModal } from "./QuoteRequestModal";
import ElectricBorder from "./ui/ElectricBorder";
import { HoverBorderGradient } from "./ui/hover-border-gradient";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import * as authLib from "@/lib/auth";

// Force HMR update

/*
### 🛡️ US Business Enrichment & Trust Report
Successfully enriched all **181,623** US business listings with email addresses, social media links, and standardized trust scores.
... (Kept original comment for context)
*/

interface BusinessCardProps {
  business: Business;
  rank: number;
  backgroundImage?: string;
}

function formatTradeLabel(trade?: string) {
  if (!trade) return "Tradesperson";
  return trade
    .replace(/^emergency[-\s]+/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getWebsiteUrl(website?: string) {
  if (!website) return "";
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function BusinessCard({ business, rank, backgroundImage = "/images/ui/parchment-provided.jpg" }: BusinessCardProps) {
  const { settings } = useLocalization();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(() => isAuthenticated && business.id ? authLib.isFavorite(business.id) : false);

  const isPaid = business.tier === 'paid' || business.is_premium;
  const isParchment = true; // Global standard
  const isUkCard = settings.countryCode === "GB";

  if (isUkCard) {
    const isLive = isBusinessAvailable(business);
    const tradeName = formatTradeLabel(business.trade);
    const locationLabel = business.city || business.address || "Local service area";
    const reviewLabel = business.rating
      ? `${business.rating.toFixed(1)}${business.reviewCount ? ` (${business.reviewCount} reviews)` : " rating"}`
      : "New listing";
    const websiteUrl = getWebsiteUrl(business.website);
    const whatsappNumber = business.whatsapp_number?.replace(/\D/g, "");
    const domainName = typeof window !== "undefined" ? window.location.hostname : "emergencytradesmen.co.uk";
    const waText = `Hi, I found your listing on ${domainName} and need an emergency ${tradeName.toLowerCase()} in ${business.city || "my area"}. Are you available?`;

    const handleFavorite = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        toast({ title: "Sign in to save", description: "Create an account to save your favourite tradespeople.", variant: "default" });
        return;
      }
      if (liked) {
        authLib.removeFavorite(business.id);
        setLiked(false);
        toast({ title: "Removed from saved", description: `${business.name} removed from your saved list.` });
      } else {
        authLib.addFavorite({ businessId: business.id, businessName: business.name, tradeName: business.trade || "Tradesperson", city: business.city || "" });
        setLiked(true);
        toast({ title: "Saved", description: `${business.name} pinned to the top of your list.` });
      }
    };
    const posterGlowContainer = "w-full rounded-none bg-transparent transition-transform duration-300 ease-out hover:-translate-y-0.5";
    const posterGlowColor = "#d6a95f";

    const ukCardContent = (
      <CardContainer
        backgroundImage={backgroundImage}
        className="h-[33.5rem] sm:h-[34.5rem]"
        contentClassName="h-full gap-2 px-6 pt-5 pb-16"
      >
        <div className="relative flex h-16 items-start justify-center">
          <div className="text-center">
            <p className="font-serif text-[2.65rem] font-black leading-none tracking-normal text-[#241507] drop-shadow-sm">
              WANTED
            </p>
            <div className="mx-auto mt-1 flex w-44 items-center gap-2 text-[#241507]/70">
              <span className="h-px flex-1 bg-[#241507]/35" />
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.22em]">No. {rank}</span>
              <span className="h-px flex-1 bg-[#241507]/35" />
            </div>
          </div>
          <button
            onClick={handleFavorite}
            className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full text-[#2a1b0a]/35 transition hover:bg-red-700/10 hover:text-red-700"
            aria-label={liked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-5 w-5", liked && "fill-red-700 text-red-700")} strokeWidth={1.6} />
          </button>
        </div>

        <div className="flex items-center justify-between border-y border-[#2a1b0a]/25 py-1.5">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#2a1b0a]/75">
            {tradeName}
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-[0.13em] text-[#2a1b0a]">
            <span
              className={cn(
                "h-3 w-3 rounded-full border border-[#2a1b0a]/35",
                isLive
                  ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.85)]"
                  : "bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.75)]"
              )}
              aria-hidden="true"
            />
            {isLive ? "Open / Available" : "Closed / Unavailable"}
          </span>
        </div>

        <div className="flex min-h-[5.75rem] items-center justify-center border-b-2 border-dashed border-[#2a1b0a]/30 pb-2 text-center">
          <h3 className="line-clamp-3 font-serif text-2xl font-black leading-[1.05] tracking-normal text-[#241507]">
            {business.name}
          </h3>
        </div>

        <div className="grid gap-2 rounded border border-[#2a1b0a]/20 bg-[#fcf5e5]/35 p-2.5 shadow-inner">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-normal text-[#2a1b0a]">
              <Star className="h-3.5 w-3.5 fill-[#a06a14] text-[#a06a14]" />
              {reviewLabel}
            </span>
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-[#2a1b0a]/65">
              Rating / Reviews
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] font-bold text-[#2a1b0a]/85">
            <MapPin className="h-4 w-4 shrink-0 text-[#2a1b0a]/65" />
            <span className="truncate">{locationLabel}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2 font-mono text-[12px] font-black text-[#2a1b0a]">
            <Phone className="h-4 w-4 shrink-0 text-[#2a1b0a]/65" />
            <span className="truncate">{business.phone || "Phone listed on profile"}</span>
          </div>
        </div>

        <div className="mt-auto grid gap-2">
          <HoverBorderGradient
            as={Link}
            to={`/business/${business.id}`}
            onClick={() => trackEvent("Business", "View Profile", business.name)}
            containerClassName={cn(posterGlowContainer, "h-11")}
            className="flex h-full items-center justify-between gap-2 border-2 border-[#241507]/75 bg-[#241507]/82 px-3 font-serif text-[15px] font-black uppercase tracking-normal text-[#fcf5e5] shadow-[inset_0_0_0_2px_rgba(252,245,229,0.28)] transition-colors duration-300 hover:bg-[#241507]/92 sm:text-base"
            glowColor={posterGlowColor}
            duration={0.75}
          >
            <span className="whitespace-nowrap">Reward: View Profile</span>
            <ArrowRight className="h-4 w-4" />
          </HoverBorderGradient>

          <div className={cn("grid gap-2", whatsappNumber ? "grid-cols-2" : "grid-cols-1")}>
            <HoverBorderGradient
              as="a"
              href={business.phone ? `tel:${business.phone}` : "#"}
              onClick={(e) => {
                if (!business.phone) e.preventDefault();
                trackEvent("Business", "Call Now", business.name);
              }}
              containerClassName={cn(posterGlowContainer, "h-10")}
              className="flex h-full items-center justify-center gap-2 border-2 border-[#241507]/80 bg-[#241507]/88 px-3 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#fcf5e5] transition-colors duration-300 hover:bg-[#3a230c]/90"
              glowColor={posterGlowColor}
              duration={0.75}
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </HoverBorderGradient>

            {whatsappNumber && (
              <HoverBorderGradient
                as="a"
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(waText)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("Business", "WhatsApp Click", business.name)}
                containerClassName={cn(posterGlowContainer, "h-10")}
                className="flex h-full items-center justify-center gap-2 border-2 border-emerald-950/80 bg-emerald-800/88 px-3 font-mono text-[10px] font-black uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-emerald-900/92"
                glowColor={posterGlowColor}
                duration={0.75}
              >
                <span className="flex h-4 w-4 items-center justify-center border border-white/40 text-[9px] font-black">W</span>
                WhatsApp
              </HoverBorderGradient>
            )}
          </div>

          {websiteUrl ? (
            <HoverBorderGradient
              as="a"
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Business", "Visit Website", business.name)}
              containerClassName={cn(posterGlowContainer, "mx-8 h-10 w-auto sm:mx-10")}
              className="flex h-full items-center justify-center gap-2 border-2 border-[#2a1b0a]/85 bg-[#fcf5e5]/68 px-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#241507] transition-colors duration-300 hover:bg-[#241507]/88 hover:text-[#fcf5e5]"
              glowColor={posterGlowColor}
              duration={0.75}
            >
              Visit Website
              <ExternalLink className="h-3.5 w-3.5" />
            </HoverBorderGradient>
          ) : (
            <div aria-hidden="true" className="mx-8 h-10 w-auto border-2 border-[#2a1b0a]/20 bg-[#fcf5e5]/30 sm:mx-10" />
          )}
        </div>
      </CardContainer>
    );

    if (isPaid && !backgroundImage) {
      return (
        <ElectricBorder
          color="#c5a059"
          speed={1}
          chaos={0.12}
          borderRadius={32}
          className="w-full max-w-[85vw] sm:max-w-[20rem] md:max-w-[22rem] mx-auto"
        >
          {ukCardContent}
        </ElectricBorder>
      );
    }

    return ukCardContent;
  }

  const cardContent = (
    <CardContainer backgroundImage={backgroundImage}>
      {/* 1. Header (Rank + Facorite + Trade) */}
      <CardHeader business={business} rank={rank} isParchment={isParchment} />

      {/* 2. Hero (Name + Trust Shield) */}
      <CardHero business={business} isParchment={isParchment} />

      {/* 3. Status Grid (Rating + Availability) */}
      <CardStatus business={business} isParchment={isParchment} />

      {/* 4. Details Stack (Address, Hours, Website) */}
      <CardDetails business={business} isParchment={isParchment} />

      {/* 5. Social Media Icons (Compact) */}
      <CardSocials business={business} isParchment={isParchment} />

      {/* 6. Evidence-backed trust signals */}
      <TrustBadgeStack business={business} compact className="mt-2 justify-center px-3 relative z-20 font-ui" />

      {/* 6. Actions (Call / WhatsApp) */}
      <CardActions business={business} isParchment={isParchment} />

      <QuoteRequestModal
        businessId={business.id}
        businessName={business.name}
        tradeName={business.trade || "Emergency service"}
        variant="outline"
        triggerText="Request Quote"
        className="relative z-20 h-9 w-full rounded-none border-[#2a1b0a]/30 bg-[#fcf5e5]/45 px-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#2a1b0a] hover:border-[#2a1b0a]/45 hover:bg-[#fcf5e5]/75 hover:text-[#2a1b0a]"
      />

      {/* 7. Footer Pill (Listing Status) */}
      <div className="flex flex-col items-center gap-2 mt-3 relative z-20 h-auto font-ui">
        <ListingStatusBadge business={business} className="rounded border-[#2a1b0a]/20 bg-[#fcf5e5]/40 text-[#2a1b0a] font-mono" />
        <ClaimListingModal
          business={business}
          compact
          triggerClassName="h-7 rounded-none border-[#2a1b0a]/20 bg-[#fcf5e5]/40 px-2 text-[10px] font-mono uppercase tracking-widest text-[#2a1b0a] hover:bg-[#fcf5e5]/70"
        />
      </div>
    </CardContainer>
  );

  if (isPaid && !backgroundImage) {
    return (
      <ElectricBorder
        color="#c5a059" // Match the gold theme
        speed={1}
        chaos={0.12}
        borderRadius={32}
        className="w-full max-w-[85vw] sm:max-w-[20rem] md:max-w-[22rem] mx-auto"
      >
        {cardContent}
      </ElectricBorder>
    );
  }

  return cardContent;
}
