import os

triage_path = r"..\src\components\EmergencyTriageModal.tsx"

with open(triage_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add Input import and search state
if 'import { Input } from "@/components/ui/input";' not in content:
    content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";\nimport { Input } from "@/components/ui/input";')

# Addition of city search state
if 'const [citySearch, setCitySearch] = useState("");' not in content:
    content = content.replace('const [verificationAnswer, setVerificationAnswer] = useState<string>("");', 'const [verificationAnswer, setVerificationAnswer] = useState<string>("");\n    const [citySearch, setCitySearch] = useState("");')

# Update the location step UI to include manual input
new_location_ui = """                    {/* Location Detection - NO EMAIL BUTTONS */}
                    {step === "location" && (
                        <div className="flex flex-col items-center justify-center space-y-6 py-8">
                            {geoLoading ? (
                                <>
                                    <Loader2 className="w-16 h-16 animate-spin text-gold" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Detecting your location...</p>
                                        <p className="text-sm text-muted-foreground">
                                            This helps us find the nearest {currentTrade?.name?.toLowerCase()}s
                                        </p>
                                    </div>
                                </>
                            ) : place?.city ? (
                                <>
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Location Found!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Finding {currentTrade?.name?.toLowerCase()}s in {place.city}...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full max-w-sm flex flex-col items-center space-y-4">
                                    <MapPin className="w-16 h-16 text-gold mb-2" />
                                    <div className="text-center mb-4">
                                        <p className="font-medium text-lg mb-2">Where do you need help?</p>
                                        <p className="text-sm text-muted-foreground">
                                            We couldn't detect your location automatically.
                                        </p>
                                    </div>
                                    
                                    <div className="flex w-full items-center space-x-2">
                                        <Input 
                                            placeholder="Enter your city (e.g. Manchester)" 
                                            value={citySearch}
                                            onChange={(e) => setCitySearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && citySearch.trim()) {
                                                    setDetectedCity(citySearch.trim());
                                                    navigate(`/emergency-${selectedTrade}/${citySearch.trim().toLowerCase()}`);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className="bg-background border-border/50 focus:border-gold/50"
                                        />
                                        <Button 
                                            onClick={() => {
                                                if (citySearch.trim()) {
                                                    setDetectedCity(citySearch.trim());
                                                    navigate(`/emergency-${selectedTrade}/${citySearch.trim().toLowerCase()}`);
                                                    setIsOpen(false);
                                                }
                                            }}
                                            className="bg-gold hover:bg-gold/90 text-black border-none"
                                            disabled={!citySearch.trim()}
                                        >
                                            Find
                                        </Button>
                                    </div>
                                    
                                    <div className="pt-4 w-full">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/50"></span></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or</span></div>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={getLocation}
                                        variant="outline"
                                        className="w-full border-gold/30 hover:bg-gold/5 text-foreground"
                                    >
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Try Auto-Detect Again
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}"""

# Replace the old location block
target_block = """                    {/* Location Detection - NO EMAIL BUTTONS */}
                    {step === "location" && (
                        <div className="flex flex-col items-center justify-center space-y-6 py-8">
                            {geoLoading ? (
                                <>
                                    <Loader2 className="w-16 h-16 animate-spin text-gold" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Detecting your location...</p>
                                        <p className="text-sm text-muted-foreground">
                                            This helps us find the nearest {currentTrade?.name?.toLowerCase()}s
                                        </p>
                                    </div>
                                </>
                            ) : place?.city ? (
                                <>
                                    <CheckCircle className="w-16 h-16 text-green-500" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Location Found!</p>
                                        <p className="text-sm text-muted-foreground">
                                            Finding {currentTrade?.name?.toLowerCase()}s in {place.city}...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-16 h-16 text-gold" />
                                    <div className="text-center">
                                        <p className="font-medium text-lg mb-2">Location Required</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Please enable location services to continue
                                        </p>
                                        <Button
                                            onClick={getLocation}
                                            className="bg-gold hover:bg-gold/90 text-black"
                                        >
                                            <Navigation className="w-4 h-4 mr-2" />
                                            Enable Location
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}"""

if target_block in content:
    content = content.replace(target_block, new_location_ui)
    print("Manual fallback added to Triage Modal.")
else:
    # Try with slightly different whitespace if it fails
    print("Direct match failed, check whitespace or code changes.")
    exit(1)

with open(triage_path, "w", encoding="utf-8") as f:
    f.write(content)
