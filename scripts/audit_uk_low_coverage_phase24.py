
import os
import re
import json
from supabase import create_client

# Environment Setup
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
    print("Error: Supabase credentials not found.")
    exit(1)

sb = create_client(url, key)

# 1. Load All Valid UK Cities
city_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts"
valid_cities = []
with open(city_file, 'r', encoding='utf-8') as f:
    content = f.read()
    # Extract keys from export const cityPostcodes = { ... }
    # This regex looks for: "City Name": "Postcode"
    matches = re.findall(r'[\'"](.*?)[\'"]\s*:', content)
    # Filter out potential internal keys if any, but mostly these are city names
    for m in matches:
        if m not in ["", " "]: valid_cities.append(m)

print(f"Loaded {len(valid_cities)} valid UK cities/locations.")

# 2. Load Valid Trades
trade_slugs = [
    "plumber", "electrician", "locksmith", "gas-engineer", "glazier", 
    "drain-specialist", "pest-control", "heating-engineer", "roofer", 
    "builder", "appliance-repair"
] # Standard 11 from trades.ts

# 3. Fetch All UK Listings (Batch Fetch for Speed)
print("Fetching all UK listings from Supabase (this may take a moment)...")
all_listings = []
start = 0
batch_size = 5000
while True:
    res = sb.table('businesses').select('city, trade').eq('country_code', 'GB').range(start, start + batch_size - 1).execute()
    data = res.data
    if not data: break
    all_listings.extend(data)
    start += batch_size
    print(f"Fetched {len(all_listings)} records so far...")

print(f"Total UK Listings: {len(all_listings)}")

# 4. Inventory Matrix
# (City, Trade) -> Count
inventory = {}
for item in all_listings:
    c = item.get('city')
    t = item.get('trade')
    if c and t:
        # Normalize city key? Ideally yes, but DB should match valid_cities by now
        # We will try exact match first
        k = (c, t)
        inventory[k] = inventory.get(k, 0) + 1

# 5. Identify Gaps
low_coverage = [] # List of {"city": c, "trade": t, "count": n}
threshold = 3 

for city in valid_cities:
    # Skip extremely obscure aliases if needed, but user wants ALL
    for trade in trade_slugs:
        k = (city, trade)
        count = inventory.get(k, 0)
        if count < threshold:
            low_coverage.append({
                "city": city,
                "trade": trade,
                "count": count
            })

# 6. Save Report
output_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\uk_low_coverage_audit_phase24.json"
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(low_coverage, f, indent=2)

print(f"\nAudit Complete.")
print(f"Total Low Coverage (< {threshold}) Pages: {len(low_coverage)}")
print(f"Report saved to: {output_file}")

# 7. Print Top 20 Empty Cities (Aggregated)
# Count how many empty trades per city
city_emptiness = {}
for item in low_coverage:
    city = item['city']
    city_emptiness[city] = city_emptiness.get(city, 0) + 1

sorted_cities = sorted(city_emptiness.items(), key=lambda x: x[1], reverse=True)
print("\n--- Top 20 Most Empty Cities (By missing trades) ---")
for i, (city, gap_count) in enumerate(sorted_cities[:20]):
    print(f"{i+1}. {city}: {gap_count} trades low/empty")
