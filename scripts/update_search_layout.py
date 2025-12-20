
import os

search_form_path = r"..\src\components\SearchForm.tsx"
index_path = r"..\src\pages\Index.tsx"

new_search_form = """import { useState, useEffect } from "react";
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

  const { getLocation, loading: geoLoading, place } = useGeolocation();

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
  }, [place, toast, navigate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedTrade && selectedCity) {
      navigate(`/emergency-${selectedTrade}/${selectedCity.toLowerCase()}`);
    } else if (!selectedTrade || !selectedCity) {
        toast({
            title: "Selection Required",
            description: "Please select both a trade and a city to continue.",
            variant: "destructive"
        });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 mt-16 mb-12">
      <div className="flex flex-wrap items-center justify-center gap-4">
        
        {/* Select Trade Button */}
        <div className="relative group w-full sm:w-auto min-w-[220px]">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-14 px-5 shadow-2xl transition-all hover:border-gold/30">
            <Wrench className="w-5 h-5 mr-3 text-gold" />
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-white focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="" className="bg-neutral-900 text-muted-foreground">Select Trade</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug} className="bg-neutral-900 text-white">
                  {trade.name}
                </option>
              ))}
            </select>
            <div className="absolute right-5 pointer-events-none">
                <ArrowRight className="w-4 h-4 text-white/30 rotate-90" />
            </div>
          </div>
        </div>

        {/* Select City Button */}
        <div className="relative group w-full sm:w-auto min-w-[220px]">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-14 px-5 shadow-2xl transition-all hover:border-gold/30">
            <MapPin className="w-5 h-5 mr-3 text-gold" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-base font-medium text-white focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="" className="bg-neutral-900 text-muted-foreground">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-neutral-900 text-white">
                  {city}
                </option>
              ))}
            </select>
            <div className="absolute right-5 pointer-events-none">
                <ArrowRight className="w-4 h-4 text-white/30 rotate-90" />
            </div>
          </div>
        </div>

        {/* Locate Me Button */}
        <Button
          type="button"
          onClick={getLocation}
          disabled={geoLoading}
          variant="outline"
          className="w-full sm:w-auto rounded-full h-14 px-8 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-base font-medium transition-all shadow-2xl group"
        >
          {geoLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-3" />
          ) : (
            <Navigation className="w-5 h-5 mr-3 text-gold group-hover:animate-pulse" />
          )}
          Locate Me
        </Button>

        {/* Search Action Button */}
        <Button
          onClick={() => handleSubmit()}
          disabled={!selectedTrade || !selectedCity}
          className="w-full sm:w-auto rounded-full h-14 px-10 bg-gold hover:bg-gold/80 text-black font-bold text-base transition-all shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          Find Help Now
          <ArrowRight className="w-5 h-5 ml-3" />
        </Button>

      </div>
    </div>
  );
}
"""

with open(search_form_path, "w", encoding="utf-8") as f:
    f.write(new_search_form)

# Add extra spacing in Index.tsx
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Increase margin between chatbot and search form
# Original: mb-8 before <SearchForm />
index_content = index_content.replace('mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">', 'mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

print("SearchForm refactored and Index spacing updated.")
