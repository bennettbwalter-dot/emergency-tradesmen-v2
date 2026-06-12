import { Business } from "@/lib/businesses";
import { WantedPosterCard } from "./WantedPosterCard";
import ElectricBorder from "./ui/ElectricBorder";

interface BusinessCardProps {
  business: Business;
  rank: number;
  backgroundImage?: string;
}

/*
### 🛡️ US Business Enrichment & Trust Report
Successfully enriched all **181,623** US business listings with email addresses, social media links, and standardized trust scores.
... (Kept original comment for context)
*/

export function BusinessCard({ business, rank, backgroundImage = "/images/ui/parchment-provided.jpg" }: BusinessCardProps) {
  const isPaid = business.tier === "paid" || business.is_premium;

  const cardContent = (
    <WantedPosterCard
      business={business}
      rank={rank}
      backgroundImage={backgroundImage}
    />
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
        {cardContent}
      </ElectricBorder>
    );
  }

  return cardContent;
}
