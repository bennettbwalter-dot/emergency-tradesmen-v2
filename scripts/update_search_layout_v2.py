
import os

search_form_path = r"..\src\components\SearchForm.tsx"

new_content = """    <div className="w-full max-w-2xl mx-auto px-4 mt-4 mb-12">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Select Trade Button */}
        <div className="relative group w-full">
          <div className="absolute -inset-0.5 bg-gold/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-14 px-4 shadow-2xl transition-all hover:border-gold/30">
            <Wrench className="w-4 h-4 mr-2 text-gold shrink-0" />
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none pr-4"
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
          <div className="relative flex items-center bg-black/80 backdrop-blur-xl border border-white/10 rounded-full h-14 px-4 shadow-2xl transition-all hover:border-gold/30">
            <MapPin className="w-4 h-4 mr-2 text-gold shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer appearance-none pr-4"
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
          onClick={getLocation}
          disabled={geoLoading}
          variant="outline"
          className="w-full rounded-full h-14 px-4 border-white/10 bg-black/80 backdrop-blur-xl hover:bg-gold/10 hover:border-gold/30 text-white text-sm font-medium transition-all shadow-2xl group"
        >
          {geoLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Navigation className="w-4 h-4 mr-2 text-gold group-hover:animate-pulse" />
          )}
          Locate Me
        </Button>

        {/* Search Action Button */}
        <Button
          onClick={() => handleSubmit()}
          disabled={!selectedTrade || !selectedCity}
          className="w-full rounded-full h-14 px-4 bg-gold hover:bg-gold/80 text-black font-bold text-sm transition-all shadow-2xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          Find Help Now
        </Button>

      </div>
    </div>"""

with open(search_form_path, "r", encoding="utf-8") as f:
    content = f.read()

import re
old_block_pattern = r'    <div className="w-full max-w-5xl mx-auto px-4 mt-16 mb-12">[\s\S]*?<\/div>\s*<\/div>'
content = re.sub(old_block_pattern, new_content, content)

with open(search_form_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SearchForm layout updated.")
