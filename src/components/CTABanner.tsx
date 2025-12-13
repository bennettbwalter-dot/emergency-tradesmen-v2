import { useState, useEffect } from "react";
import { Phone, Clock, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchBusinesses } from "@/lib/businessService";
import type { Business } from "@/lib/businesses";
import { Link } from "react-router-dom";

interface CTABannerProps {
  trade: string;
  city: string;
}

export function CTABanner({ trade, city }: CTABannerProps) {
  const [spotlightBusiness, setSpotlightBusiness] = useState<Business | null>(null);

  // Normalize inputs to match database format (lowercase)
  const normalizedTrade = trade?.toLowerCase().trim() || "";
  const normalizedCity = city?.trim() || "";

  useEffect(() => {
    async function getSpotlight() {
      if (!normalizedTrade || !normalizedCity) return;

      try {
        const businesses = await fetchBusinesses(normalizedTrade, normalizedCity);
        // Pick the top verified business (already sorted by rating)
        if (businesses.length > 0) {
          setSpotlightBusiness(businesses[0]);
        }
      } catch (error) {
        console.error('Error fetching spotlight business:', error);
      }
    }
    getSpotlight();
  }, [normalizedTrade, normalizedCity]);

  // Trade-specific fallback images (high quality Unsplash)
  const tradeImages: Record<string, string> = {
    default: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80",
    plumber: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80",
    electrician: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80",
    locksmith: "https://images.unsplash.com/photo-1581578014828-0904d60fc455?auto=format&fit=crop&q=80", // Construction/tool vibe
    "gas engineer": "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80", // Industrial/Engineer
  };

  const getFallbackImage = (t: string) => {
    if (!t) return tradeImages["default"];
    const key = Object.keys(tradeImages).find(k => t.toLowerCase().includes(k));
    return tradeImages[key || "default"];
  };

  // Safe checks
  const safeTrade = trade || "Tradesperson";
  const bgImage = spotlightBusiness?.photos?.find(p => p.isPrimary)?.url || getFallbackImage(safeTrade);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary p-8 md:p-12">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        {bgImage ? (
          <img
            src={bgImage}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-primary to-primary/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/60" />
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl z-0" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left flex-1">
          {spotlightBusiness ? (
            <div className="mb-4 animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/20 mb-3">
                <Star className="w-3 h-3 fill-gold" />
                <span className="text-xs font-bold uppercase tracking-wider">Top Rated Pro in {city}</span>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1 flex items-center justify-center md:justify-start gap-2">
                {spotlightBusiness.name}
                <ShieldCheck className="w-5 h-5 text-gold" />
              </h3>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gold text-sm mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(spotlightBusiness.rating) ? "fill-gold" : "text-muted"}`} />
                  ))}
                </div>
                <span>{spotlightBusiness.rating} ({spotlightBusiness.reviewCount} reviews)</span>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              <span className="text-sm font-medium">Tradespeople available now</span>
            </div>
          )}

          <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
            Need an Emergency {trade} in {city}?
          </h2>
          <p className="text-primary-foreground/80 flex items-center justify-center md:justify-start gap-2">
            <Clock className="w-4 h-4" />
            Average response time: 30-60 minutes
          </p>
        </div>

        <Button variant="hero" size="xl" asChild className="shrink-0">
          {spotlightBusiness?.phone ? (
            <a href={`tel:${spotlightBusiness.phone}`} className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              Call: {spotlightBusiness.phone}
            </a>
          ) : (
            <Link to="/contact" className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              Contact Us
            </Link>
          )}
        </Button>
      </div>
    </section>
  );
}
