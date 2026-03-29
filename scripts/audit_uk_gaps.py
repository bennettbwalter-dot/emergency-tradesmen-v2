
import os
import re
import json
from supabase import create_client, Client

# 1. Setup Supabase
env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            clean_line = line.strip()
            if clean_line.startswith("VITE_SUPABASE_URL="):
                url = clean_line.split('=', 1)[1].strip()
            elif clean_line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = clean_line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

# 2. Get Expected UK Cities
city_postcodes_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts"
uk_cities = []

with open(city_postcodes_path, 'r', encoding='utf-8') as f:
    content = f.read()
    # Regex to find keys in the map: "CityName": "Postcode"
    # Matches: "London": "SW1A 1AA",
    matches = re.findall(r'"([^"]+)":\s*"[^"]+"', content)
    uk_cities = matches

print(f"Found {len(uk_cities)} expected UK cities in cityPostcodes.ts")

# 3. Define Trades
trades = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
]

# 4. Fetch All Businesses
print("Fetching all businesses from Supabase...")
# We fetch all fields needed to identify city/trade/country
# count='exact' isn't needed if we fetch all data, but let's fetch in chunks if needed?
# 2600 rows is small. default limit is usually 1000. need to paginate.
all_listings = []
page = 0
page_size = 1000
while True:
    res = supabase.table('businesses').select('city, trade, country_code').range(page * page_size, (page + 1) * page_size - 1).execute()
    data = res.data
    all_listings.extend(data)
    if len(data) < page_size:
        break
    page += 1

print(f"Total businesses fetched: {len(all_listings)}")

# 5. Analyze Gaps
# Build a map of (city_lower, trade) -> count
counts = {}

for b in all_listings:
    c = b.get('city', '').strip()
    t = b.get('trade', '').strip()
    
    # Normalize city key for matching
    # In cityPostcodes, keys are Case Sensitive normally, but let's match exact first, then lower?
    # Actually, the insertion used exact strings from keys (mostly).
    # But let's use lower for counting to be safe against case variations.
    
    key = (c.lower(), t)
    counts[key] = counts.get(key, 0) + 1

gaps = []
low_count = [] # 1 listing
ok_count = [] # 2+ listings

for city in uk_cities:
    for trade in trades:
        key = (city.lower(), trade)
        count = counts.get(key, 0)
        
        if count == 0:
            gaps.append({"city": city, "trade": trade, "count": 0})
        elif count == 1:
            low_count.append({"city": city, "trade": trade, "count": 1})
        else:
            ok_count.append({"city": city, "trade": trade, "count": count})

# 6. Report
print(f"Analysis Complete.")
print(f"Total combinations checked: {len(uk_cities) * len(trades)}")
print(f"No Listings (GAPS): {len(gaps)}")
print(f"Low Listings (1 only): {len(low_count)}")
print(f"OK Listings (2+): {len(ok_count)}")

# Write to file
output_file = "uk_gaps_report.json"
with open(output_file, 'w') as f:
    json.dump({
        "gaps": gaps,
        "low_count": low_count
    }, f, indent=2)

print(f"Detailed report written to {output_file}")

# Preview some gaps
if gaps:
    print("\nSample Gaps (First 10):")
    for g in gaps[:10]:
        print(f" - {g['city']} : {g['trade']}")
