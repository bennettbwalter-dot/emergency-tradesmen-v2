import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Wrench, Loader2, Navigation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trades, cities } from "@/lib/trades";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useToast } from "@/hooks/use-toast";
import { useChatbot } from "@/contexts/ChatbotContext";

export function SearchForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    detectedTrade: selectedTrade,
    detectedCity: selectedCity,
    isRequestingLocation,
    setDetectedTrade: setSelectedTrade,
    setDetectedCity: setSelectedCity,
    setIsRequestingLocation
  } = useChatbot();

  const { getLocation, loading: geoLoading, place } = useGeolocation();
  const shouldHighlight = isRequestingLocation && !selectedCity;

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
    <div className="w-full max-w-2xl mx-auto px-4 mt-4 mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Select Trade Button */}
        <div className="relative group w-full">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-secondary backdrop-blur-xl border border-border rounded-full h-14 px-4 shadow-2xl transition-all hover:border-gold/30">
            <Wrench className="w-4 h-4 mr-3 text-gold shrink-0" />
            <div className="flex flex-col items-start justify-center leading-tight overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-gold/60 tracking-widest leading-none mb-0.5">Select</span>
              <span className="text-sm font-bold text-foreground truncate max-w-[100px]">
                {selectedTrade ? trades.find(t => t.slug === selectedTrade)?.name : "Trade"}
              </span>
            </div>
            <select
              value={selectedTrade}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTrade(val);
                if (val && !selectedCity) {
                  getLocation();
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="" className="bg-neutral-900 text-muted-foreground">Select Trade</option>
              {trades.map((trade) => (
                <option key={trade.slug} value={trade.slug} className="bg-neutral-900 text-white">
                  {trade.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none">
              <ArrowRight className="w-3 h-3 text-white/30 rotate-90" />
            </div>
          </div>
        </div>

        {/* Select City Button */}
        <div className="relative group w-full">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-secondary backdrop-blur-xl border border-border rounded-full h-14 px-4 shadow-2xl transition-all hover:border-gold/30">
            <MapPin className="w-4 h-4 mr-3 text-gold shrink-0" />
            <div className="flex flex-col items-start justify-center leading-tight overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-gold/60 tracking-widest leading-none mb-0.5">Select</span>
              <span className="text-sm font-bold text-foreground truncate max-w-[100px]">
                {selectedCity || "City"}
              </span>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            >
              <option value="" className="bg-neutral-900 text-muted-foreground">Select City</option>
              {cities.map((city) => (
                <option key={city} value={city} className="bg-neutral-900 text-white">
                  {city}
                </option>
              ))}
            </select>
            <div className="absolute right-4 pointer-events-none">
              <ArrowRight className="w-3 h-3 text-white/30 rotate-90" />
            </div>
          </div>
        </div>

        {/* Locate Me Button */}
        <Button
          type="button"
          onClick={() => { getLocation(); setIsRequestingLocation(false); }}
          disabled={geoLoading}
          variant="outline"
          className={`relative w-full rounded-full h-14 px-4 border-border bg-secondary backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-foreground transition-all shadow-2xl group ${shouldHighlight ? 'ring-2 ring-gold/50 shadow-[0_0_20px_rgba(255,183,0,0.5)] animate-pulse border-gold/50' : ''
            }`}
        >
          <div className="flex items-center w-full">
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-3 shrink-0" />
            ) : (
              <Navigation className="w-4 h-4 mr-3 text-gold group-hover:animate-pulse shrink-0" />
            )}
            <div className="flex flex-col items-start justify-center leading-tight text-left">
              <span className="text-[10px] uppercase font-bold text-gold/60 tracking-widest leading-none mb-0.5">Locate</span>
              <span className="text-sm font-bold text-foreground">Me</span>
            </div>
          </div>
        </Button>

        {/* Search Action Button */}
        <Button
          onClick={() => handleSubmit()}
          disabled={!selectedTrade || !selectedCity}
          className="w-full rounded-full h-14 px-4 bg-gold hover:bg-gold/80 text-black transition-all shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <div className="flex flex-col items-center justify-center leading-tight">
            <span className="text-[10px] uppercase font-black tracking-widest leading-none mb-0.5 opacity-60">Find Help</span>
            <span className="text-sm font-bold">Now</span>
          </div>
        </Button>

      </div>
    </div>
  );
}
