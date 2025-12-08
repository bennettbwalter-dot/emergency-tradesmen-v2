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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-2xl p-2 border border-border">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
          <div className="relative">
            <Wrench className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary text-foreground border-0 appearance-none cursor-pointer font-medium focus:ring-2 focus:ring-accent focus:outline-none"
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
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-secondary text-foreground border-0 appearance-none cursor-pointer font-medium focus:ring-2 focus:ring-accent focus:outline-none"
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
