
import os

path = "../src/components/SearchForm.tsx"

# Applying Blackbox AI Style (Pill Shape)
content = '''import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Wrench, Loader2, Navigation, ArrowRight } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto px-4 mt-4">
      <div className="relative group">
        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-gold/30 to-amber-500/30 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        
        {/* Main Pill Container */}
        <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-14 p-1 pl-4 shadow-2xl">
          
          {/* Trade Selector Section */}
          <div className="flex-1 flex items-center min-w-0 border-r border-white/5 pr-2">
            <div className="mr-2 text-muted-foreground">
              <Wrench className="w-4 h-4" />
            </div>
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-pointer appearance-none truncate"
            >
              <option value="" className="bg-black text-muted-foreground">Is it a...</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug} className="bg-black text-white">
                  {trade.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selector Section */}
          <div className="flex-1 flex items-center min-w-0 pl-3">
            <div className="mr-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none cursor-pointer appearance-none truncate"
            >
              <option value="" className="bg-black text-muted-foreground">In...</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-black text-white">
                  {city}
                </option>
              ))}
            </select>
            
            {/* Locate Me (Inside City Section) */}
            <button
              type="button"
              onClick={getLocation}
              disabled={geoLoading}
              className="p-2 mr-1 text-muted-foreground hover:text-gold transition-colors rounded-full hover:bg-white/5"
              title="Locate Me"
            >
               {geoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
            </button>
          </div>

          {/* Search Action Button (Circle) */}
          <Button
            type="submit"
            size="icon"
            className="rounded-full w-10 h-10 bg-white text-black hover:bg-gold hover:text-white transition-all shrink-0 ml-1"
            disabled={!selectedTrade || !selectedCity}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>

        </div>
      </div>
    </form>
  );
}
'''

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied Blackbox Style to SearchForm.tsx")
