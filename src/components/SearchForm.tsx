import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trades, cities } from "@/lib/trades";

export function SearchForm() {
  const navigate = useNavigate();
  const [selectedTrade, setSelectedTrade] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTrade && selectedCity) {
      navigate(`/emergency-${selectedTrade}/${selectedCity.toLowerCase()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="relative bg-card/80 backdrop-blur-md rounded-lg border border-border/50 p-2 glow-gold">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/40 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-gold/40 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-gold/40 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/40 rounded-br-lg" />
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
          <div className="relative">
            <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/70" />
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full h-14 pl-12 pr-10 rounded-md bg-secondary/50 text-foreground border border-border/30 appearance-none cursor-pointer font-medium focus:ring-1 focus:ring-gold/50 focus:border-gold/50 focus:outline-none transition-all"
            >
              <option value="">Select trade...</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug}>
                  {trade.icon} Emergency {trade.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gold/70" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-14 pl-12 pr-10 rounded-md bg-secondary/50 text-foreground border border-border/30 appearance-none cursor-pointer font-medium focus:ring-1 focus:ring-gold/50 focus:border-gold/50 focus:outline-none transition-all"
            >
              <option value="">Select city...</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <Button 
            type="submit" 
            variant="cta" 
            size="xl"
            disabled={!selectedTrade || !selectedCity}
            className="w-full md:w-auto"
          >
            <Search className="w-5 h-5" />
            <span className="md:hidden">Find Now</span>
          </Button>
        </div>
      </div>
    </form>
  );
}