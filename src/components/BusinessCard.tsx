import { Business } from "@/lib/businesses";
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

      {/* 6. Evidence-backed trust signals */}
      <TrustBadgeStack business={business} compact className="mt-2 justify-center px-3 relative z-20 font-ui" />

      {/* 6. Actions (Call / WhatsApp) */}
      <CardActions business={business} isParchment={isParchment} />

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
