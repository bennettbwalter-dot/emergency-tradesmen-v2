
import os

path = "../src/components/SearchForm.tsx"

# We will completely overwrite SearchForm.tsx with the "Small/Compact" version
# derived from the structure seen in the broken dump but cleaned up.
# Requirements:
# - "Select Trade", "Select City", "Locate Me"
# - Small (h-10 or h-12, not h-14)
# - Rounded Full? User said "buttons were round".
# - Under Chat Box.

content = '''import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Wrench, Loader2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trades, cities } from "@/lib/trades";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";

export function SearchForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTrade, setSelectedTrade] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const { getLocation, loading: geoLoading, error: geoError, place } = useGeolocation();

  // Handle geolocation result
  useEffect(() => {
    if (place?.city) {
      const exactMatch = cities.find(c => c.toLowerCase() === place.city.toLowerCase());
      if (exactMatch) {
        setSelectedCity(exactMatch);
        toast({
          title: "Location Found",
          description: `We found you in ${exactMatch}.`,
        });
      } else {
        toast({
            title: "Location Found",
            description: `You are in ${place.city}. Select the closest city from the list.`,
        });
      }
    }
  }, [place, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrade && selectedCity) {
      navigate(`/emergency-${selectedTrade}/${selectedCity.toLowerCase()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="bg-card/80 backdrop-blur-md rounded-full border border-border/50 p-1 glow-gold shadow-lg flex flex-col md:flex-row gap-1">
        
        {/* Trade Selector */}
        <div className="relative flex-1 min-w-[200px]">
           <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
           <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/30 text-foreground border-none appearance-none cursor-pointer text-sm font-medium focus:ring-1 focus:ring-gold/50 focus:outline-none transition-all"
           >
              <option value="">Select trade...</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug}>
                  Emergency {trade.name}
                </option>
              ))}
           </select>
        </div>

        {/* City Selector */}
        <div className="relative flex-1 min-w-[200px]">
           <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/70" />
           <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-10 pl-10 pr-10 rounded-full bg-secondary/30 text-foreground border-none appearance-none cursor-pointer text-sm font-medium focus:ring-1 focus:ring-gold/50 focus:outline-none transition-all"
           >
              <option value="">Select city...</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
           </select>
           
           {/* Locate Me Button inside City Input */}
           <button
              type="button"
              onClick={getLocation}
              disabled={geoLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gold/10 rounded-full text-gold transition-colors"
              title="Use my location"
            >
              {geoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
            </button>
        </div>

        {/* Submit Button */}
        <Button
            type="submit"
            variant="cta"
            size="sm"
            disabled={!selectedTrade || !selectedCity}
            className="rounded-full px-6 h-10"
        >
            <Search className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Find Now</span>
        </Button>

      </div>
    </form>
  );
}
'''

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Replaced SearchForm with Compact/Rounded Version (Day 10 style)")
