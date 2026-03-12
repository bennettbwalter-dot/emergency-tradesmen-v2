import { Business, calculateTrustScore } from "@/lib/businesses";
import { ShieldCheck } from "lucide-react";
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
}

export function BusinessCard({ business, rank }: BusinessCardProps) {
  // Trust Score (1-5 Basis) used for the footer pill
  const trustScore = calculateTrustScore(business);
  const isPaid = business.tier === 'paid' || business.is_premium;

  const cardContent = (
    <CardContainer>
      {/* 1. Header (Rank + Facorite + Trade) */}
      <CardHeader business={business} rank={rank} />

      {/* 2. Hero (Name + Trust Shield) */}
      <CardHero business={business} />

      {/* 3. Status Grid (Rating + Availability) */}
      <CardStatus business={business} />

      {/* 4. Details Stack (Address, Hours, Website) */}
      <CardDetails business={business} />

      {/* 5. Social Media Icons (Compact) */}
      <CardSocials business={business} />

      {/* 6. Actions (Call / WhatsApp) */}
      <CardActions business={business} />

      {/* 6. Footer Pill (Trust Badge) - Premium Jewel Effect */}
      <div className="flex justify-center mt-3 relative z-20 h-auto font-ui">
        <div className={`flex items-center gap-2.5 px-5 py-1.5 rounded-full border shadow-[0_4px_10px_rgba(0,0,0,0.1)] relative overflow-hidden shrink-0 backdrop-blur-xl transition-all duration-300 group hover:scale-105 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]
             ${trustScore === 5
            ? 'bg-gradient-to-b from-white/95 to-white/90 dark:from-[#2a2a35]/95 dark:to-[#1a1a24]/90 border-amber-400/40 shadow-glow-gold/40'
            : 'bg-white/90 dark:bg-[#1e293b]/80 border-gold/30 shadow-lg'}`}>

          {/* Shimmer - angled and wider for more 'sheen' */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out -skew-x-12" />

          {/* Icon Container with 'Inset' feel */}
          <div className={`w-5 h-5 rounded-full flex items-center justify-center shadow-inner text-white shrink-0 z-10 relative overflow-hidden
                ${trustScore === 5
              ? 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 ring-1 ring-amber-400/50'
              : 'bg-gradient-to-br from-gold-light via-gold to-gold-dark ring-1 ring-gold/50'}`}>
            {/* Simple highlight for volume */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-80" />
            <ShieldCheck className="w-2.5 h-2.5 relative z-10 drop-shadow-sm" strokeWidth={3} />
          </div>

          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest translate-y-[0.5px] z-10 ${trustScore === 5 ? 'text-amber-800 dark:text-amber-100 drop-shadow-sm' : 'text-gold-dark dark:text-gold-light'}`}>
            {trustScore === 5 ? 'Top Rated 5/5' : `Verified ${trustScore}/5`}
          </span>
        </div>
      </div>
    </CardContainer>
  );

  if (isPaid) {
    return (
      <ElectricBorder
        color="#c5a059" // Match the gold theme
        speed={1}
        chaos={0.12}
        borderRadius={32}
        className="w-full max-w-[22rem] mx-auto"
      >
        {cardContent}
      </ElectricBorder>
    );
  }

  return cardContent;
}
