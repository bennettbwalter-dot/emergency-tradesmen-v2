
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, X, Check, Search } from "lucide-react";
import { EditorProps } from "./types";
import { motion } from "framer-motion";
import { trades, cities } from "@/lib/trades";

const SERVICE_OPTIONS = [
    "Emergency Callouts", "24/7 Availability", "Free Quotes", "Domestic Work",
    "Commercial Work", "Maintenance", "Installations", "Repairs", "Inspections", "Certifications"
];

export function ServiceAreaTab({ formData, setFormData }: EditorProps) {
    const { toast } = useToast();
    const [citySearch, setCitySearch] = useState("");

    // Helpers
    const isPro = ['pro', 'enterprise'].includes(formData.plan_type);
    const locationLimit = isPro ? 3 : 1;
    const selectedLocations = formData.selected_locations || [];
    const selectedServices = formData.services_offered || [];

    const toggleLocation = (city: string) => {
        let newLocs = [...selectedLocations];
        if (newLocs.includes(city)) {
            newLocs = newLocs.filter(c => c !== city);
        } else {
            if (newLocs.length >= locationLimit) {
                toast({
                    title: "Plan Limit Reached",
                    description: `Your ${formData.plan_type === 'basic' ? 'Basic' : 'Pro'} plan allows ${locationLimit} location(s).`,
                    variant: "destructive"
                });
                return;
            }
            newLocs.push(city);
        }
        setFormData({ ...formData, selected_locations: newLocs });
    };

    const toggleService = (service: string) => {
        let newServs = [...selectedServices];
        if (newServs.includes(service)) {
            newServs = newServs.filter(s => s !== service);
        } else {
            newServs.push(service);
        }
        setFormData({ ...formData, services_offered: newServs });
    };

    const filteredCities = cities.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-8">

                {/* Trade Selection */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#D4AF37]" /> Trade & Services
                    </h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Primary Trade</label>
                            <Select value={formData.trade} onValueChange={v => setFormData({ ...formData, trade: v })}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-100 h-11">
                                    <SelectValue placeholder="Select Trade" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                    {trades.map(t => <SelectItem key={t.slug} value={t.slug}>{t.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-300 mb-2 block">Services Offered</label>
                            <div className="flex flex-wrap gap-2">
                                {SERVICE_OPTIONS.map(s => (
                                    <Badge
                                        key={s}
                                        variant="outline"
                                        className={`cursor-pointer transition-all py-1.5 px-3 ${selectedServices.includes(s) ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'text-slate-400 border-slate-700 hover:border-slate-500'}`}
                                        onClick={() => toggleService(s)}
                                    >
                                        {s} {selectedServices.includes(s) && <Check className="w-3 h-3 ml-1" />}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-slate-800" />

                {/* Location Selection */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-white">Service Areas</h3>
                        <Badge variant="outline" className={`border-slate-700 ${selectedLocations.length >= locationLimit ? 'text-amber-400' : 'text-slate-400'}`}>
                            {selectedLocations.length} / {locationLimit} Cities
                        </Badge>
                    </div>

                    <div className="bg-slate-950 rounded-lg border border-slate-800 p-4">
                        <div className="flex gap-2 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                                    placeholder="Search details..."
                                    value={citySearch}
                                    onChange={e => setCitySearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {filteredCities.map(city => (
                                <button
                                    key={city}
                                    onClick={() => toggleLocation(city)}
                                    disabled={!selectedLocations.includes(city) && selectedLocations.length >= locationLimit}
                                    className={`text-left px-3 py-2 rounded-md text-sm transition-all flex justify-between items-center ${selectedLocations.includes(city)
                                            ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30'
                                            : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                        } ${(!selectedLocations.includes(city) && selectedLocations.length >= locationLimit) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {city}
                                    {selectedLocations.includes(city) && <Check className="w-3 h-3" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Tags */}
                    {selectedLocations.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {selectedLocations.map((loc: string) => (
                                <Badge key={loc} className="pl-3 pr-1 py-1 text-sm bg-slate-800 text-slate-200 border-slate-700">
                                    {loc}
                                    <Button variant="ghost" size="sm" className="h-5 w-5 ml-2 p-0 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white" onClick={() => toggleLocation(loc)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </motion.div>
    );
}
