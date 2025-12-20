
import os
import re

search_path = r"..\src\components\SearchForm.tsx"

with open(search_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace('import { useState, useEffect } from "react";', 'import { useEffect } from "react";')
content = content.replace('import { useToast } from "@/hooks/use-toast";', 'import { useToast } from "@/hooks/use-toast";\nimport { useChatbot } from "@/contexts/ChatbotContext";')

# 2. Update state to use context
state_pattern = r'  const \[selectedTrade, setSelectedTrade\] = useState\(""\);\s*const \[selectedCity, setSelectedCity\] = useState\(""\);'
context_replacement = '  const { detectedTrade: selectedTrade, detectedCity: selectedCity, setDetectedTrade: setSelectedTrade, setDetectedCity: setSelectedCity } = useChatbot();'
content = re.sub(state_pattern, context_replacement, content)

# 3. Update geolocation effect to use setSelectedCity (which is now properly linked)
# No change needed if it already used the variable name 'setSelectedCity'.

# 4. Add the Auto-Routing Effect
auto_routing_effect = """
  // Auto-routing when both are selected
  useEffect(() => {
    if (selectedTrade && selectedCity) {
      navigate(`/emergency-${selectedTrade}/${selectedCity.toLowerCase()}`);
    }
  }, [selectedTrade, selectedCity, navigate]);
"""

# Insert before handleSubmit
content = content.replace('const handleSubmit', auto_routing_effect + '\n  const handleSubmit')

# 5. Enhance Trade change to trigger getLocation
trade_onchange_old = 'onChange={(e) => setSelectedTrade(e.target.value)}'
trade_onchange_new = """onChange={(e) => {
                const val = e.target.value;
                setSelectedTrade(val);
                if (val && !selectedCity) {
                  getLocation();
                }
              }}"""
content = content.replace(trade_onchange_old, trade_onchange_new)

# 6. Enhance City change just in case (though Auto-Routing handles navigation)
city_onchange_old = 'onChange={(e) => setSelectedCity(e.target.value)}'
city_onchange_new = 'onChange={(e) => setSelectedCity(e.target.value)}' # Keeping same, useEffect handles it

with open(search_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SearchForm automated routing implemented.")
