
import os

path = "../src/components/SearchForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update destructuring from useChatbot
if 'isRequestingLocation' not in content:
    content = content.replace(
        'const { detectedTrade: selectedTrade, detectedCity: selectedCity, setDetectedTrade: setSelectedTrade, setDetectedCity: setSelectedCity } = useChatbot();',
        'const { \n    detectedTrade: selectedTrade, \n    detectedCity: selectedCity, \n    isRequestingLocation, \n    setDetectedTrade: setSelectedTrade, \n    setDetectedCity: setSelectedCity, \n    setIsRequestingLocation \n  } = useChatbot();'
    )

# 2. Define shouldHighlight
if 'const shouldHighlight = isRequestingLocation && !selectedCity;' not in content:
    content = content.replace(
        'const { getLocation, loading: geoLoading, place } = useGeolocation();',
        'const { getLocation, loading: geoLoading, place } = useGeolocation();\n  const shouldHighlight = isRequestingLocation && !selectedCity;'
    )

# 3. Update getLocation to clear highlight
if 'setIsRequestingLocation(false)' not in content:
    # Need to update both the button onClick and the useEffect if necessary
    # Direct replacement in button onClick is easier
    content = content.replace(
        'onClick={getLocation}',
        'onClick={() => { getLocation(); setIsRequestingLocation(false); }}'
    )

# 4. Update selectedCity change to clear highlight
if 'setSelectedCity(val);' in content: # This is for Trade selection triggering geo
     content = content.replace(
         'getLocation();',
         'getLocation(); setIsRequestingLocation(false);'
     )

# 5. Add highlight class to Locate Me button
# Finding the Locate Me button
old_button = """        <Button
          type="button"
          onClick={() => { getLocation(); setIsRequestingLocation(false); }}
          disabled={geoLoading}
          variant="outline"
          className="w-full rounded-full h-14 px-4 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-sm font-medium transition-all shadow-2xl group"
        >"""

# Subtle pulse/glow:
# ring-2 ring-gold/50 shadow-[0_0_15px_rgba(255,183,0,0.4)] animate-pulse
new_button = """        <Button
          type="button"
          onClick={() => { getLocation(); setIsRequestingLocation(false); }}
          disabled={geoLoading}
          variant="outline"
          className={`w-full rounded-full h-14 px-4 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-sm font-medium transition-all shadow-2xl group ${
            shouldHighlight ? 'ring-2 ring-gold/50 shadow-[0_0_20px_rgba(255,183,0,0.5)] animate-pulse border-gold/50' : ''
          }`}
        >"""

if old_button in content:
    content = content.replace(old_button, new_button)
else:
    # Try more generic match if destructuring/onClick changes already happened
    content = content.replace(
        'className="w-full rounded-full h-14 px-4 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-sm font-medium transition-all shadow-2xl group"',
        'className={`w-full rounded-full h-14 px-4 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-sm font-medium transition-all shadow-2xl group ${shouldHighlight ? "ring-2 ring-gold/50 shadow-[0_0_20px_rgba(255,183,0,0.5)] animate-pulse border-gold/50" : ""}`}'
    )

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated SearchForm.tsx")
