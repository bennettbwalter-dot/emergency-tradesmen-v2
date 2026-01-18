
import os
import re
import json
from supabase import create_client

# 1. Parse valid UK cities from cityPostcodes.ts
city_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts"
valid_cities = []
city_map = {}

with open(city_file, 'r', encoding='utf-8') as f:
    content = f.read()
    matches = re.findall(r'"([^"]+)":\s*"([^"]+)"', content)
    for city, postcode in matches:
        valid_cities.append(city.strip())
        city_map[city.strip()] = postcode

# 2. Parse Trades
trades_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\trades.ts"
valid_trades = []
with open(trades_file, 'r', encoding='utf-8') as f:
    content = f.read()
    # Find slug: "electrician"
    # Matches: slug: "([^"]+)"
    matches = re.findall(r'slug:\s*"([^"]+)"', content)
    for t in matches:
        valid_trades.append(t)

# Add hardcoded known trades if parsing fails (fallback)
if not valid_trades:
    valid_trades = ["plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist", "glazier", "pest-control", "roofer", "appliance-repair", "builder", "breakdown-recovery", "air-conditioning", "water-restoration"]

# 3. Setup Supabase
env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    paths = [env_path, ".env", "../.env"]
    for p in paths:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8-sig') as f:
                for line in f:
                    if "VITE_SUPABASE_URL=" in line: url = line.split("=", 1)[1].strip().strip('"')
                    if "VITE_SUPABASE_ANON_KEY=" in line: key = line.split("=", 1)[1].strip().strip('"')
            if url: break
except: pass

if not url:
    print("No Auth.")
    exit(1)

sb = create_client(url, key)

# 4. Check for Empty Pages
# For efficiency, we can't check 4000 combos one by one.
# We will fetch ALL UK businesses and aggregate counts in memory.
print("Fetching existing listings to build count map...")
all_rows = []
start = 0
batch = 5000
while True:
    res = sb.table('businesses').select('city, trade').eq('country_code', 'GB').range(start, start + batch - 1).execute()
    data = res.data
    if not data: break
    all_rows.extend(data)
    start += batch

counts = {} # (City, Trade) -> Count
for row in all_rows:
    c = row.get('city')
    t = row.get('trade')
    if c and t:
        k = (c, t)
        counts[k] = counts.get(k, 0) + 1

# 5. Identify Gaps
# Focus on Top 50 cities (first 50 in list usually major)
top_cities = valid_cities[:50] 
print(f"Scanning Top {len(top_cities)} Cities for Gaps...")

gaps = []
for city in top_cities:
    for trade in valid_trades:
        key = (city, trade)
        count = counts.get(key, 0)
        if count == 0:
            gaps.append({"city": city, "trade": trade})

print(f"Found {len(gaps)} empty pages in Top 50 Cities.")

# Output Top 10 for immediate action
print("\n--- TOP 10 PRIORITY GAPS ---")
for i, gap in enumerate(gaps[:10]):
    print(f"{i+1}. {gap['trade'].replace('-', ' ').title()} in {gap['city']}")

# Save to file for processing
with open("priority_gaps.json", "w") as f:
    json.dump(gaps, f, indent=2)
print("Saved to priority_gaps.json")
