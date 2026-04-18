import { Business, calculateTrustScore } from "@/lib/businesses";
import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSimpleTheme } from "@/components/simple-theme";
import { CardContainer } from "./business-card/CardContainer";
import { CardHeader } from "./business-card/CardHeader";
import { CardHero } from "./business-card/CardHero";
import { CardStatus } from "./business-card/CardStatus";
import { CardDetails } from "./business-card/CardDetails";
import { CardActions } from "./business-card/CardActions";
import { CardSocials } from "./business-card/CardSocials";
import ElectricBorder from "./ui/ElectricBorder";

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

export function BusinessCard({ business, rank, backgroundImage = "/images/ui/parchment-provided.jpg" }: BusinessCardProps) {
  // Trust Score (1-5 Basis) used for the footer pill
  const trustScore = calculateTrustScore(business);
  const { theme } = useSimpleTheme();
  const isPaid = business.tier === 'paid' || business.is_premium;
  const isParchment = true; // Global standard

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

      {/* 6. Actions (Call / WhatsApp) */}
      <CardActions business={business} isParchment={isParchment} />

      {/* 6. Footer Pill (Trust Badge) - Premium Jewel Effect or Ink Stamp */}
      <div className="flex justify-center mt-3 relative z-20 h-auto font-ui">
        <div className={cn(
          "flex items-center gap-2.5 px-5 py-1.5 border relative overflow-hidden shrink-0 transition-all duration-300 group hover:scale-105",
          "bg-[#fcf5e5]/40 border-[#2a1b0a]/20 text-[#2a1b0a] font-mono rounded shadow-none"
        )}>

          {/* Shimmer - hidden on parchment */}
          {false && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out -skew-x-12" />
          )}

          {/* Icon Container with 'Inset' feel */}
          <div className={cn(
            "w-5 h-5 flex items-center justify-center shrink-0 z-10 relative overflow-hidden",
            cn("rounded-none", trustScore === 5 ? "text-amber-600" : "text-emerald-600")
          )}>
            {/* Simple highlight for volume */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-80" />
            <ShieldCheck className="w-3.5 h-3.5 relative z-10 drop-shadow-sm" strokeWidth={2.5} />
          </div>

          <span className={cn(
            "uppercase tracking-widest translate-y-[0.5px] z-10",
            "text-[10px] text-[#2a1b0a] font-mono font-bold"
          )}>
            {trustScore === 5 ? 'Top Rated 5/5' : `Verified ${trustScore}/5`}
          </span>
        </div>
      </div>
      {/* Claim listing */}
      {!isPaid && (
        <div className="flex justify-center pb-1 relative z-20">
          <Link
            to={`/business/claim/${business.id}`}
            className="text-[9px] text-[#2a1b0a]/40 hover:text-[#2a1b0a]/70 font-mono underline underline-offset-2 transition-colors"
          >
            Is this your business? Claim it free →
          </Link>
        </div>
      )}
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
