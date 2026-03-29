
import os
import json
import re
from supabase import create_client, Client
from collections import defaultdict

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

# UK Trades
TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
]

print("Fetching UK Business Counts...")

# Fetch all UK businesses minimal
all_rows = []
start = 0
limit = 1000 # Safety

while True:
    print(f"  Fetching {start}...")
    res = supabase.table('businesses').select('city, trade').eq('country_code', 'GB').range(start, start + limit - 1).execute()
    data = res.data
    if not data:
        break
    all_rows.extend(data)
    start += limit
    
print(f"Total UK Rows: {len(all_rows)}")

# Aggregate
# Map: City -> Trade -> Count
counts = defaultdict(lambda: defaultdict(int))
cities_seen = set()

for row in all_rows:
    c = row.get('city')
    t = row.get('trade')
    if c and t:
        # Normalize: Trim and Title Case
        # Some DB entries might be "Stoke-on-Trent" (correct) or "stoke-on-trent" (incorrect)
        # We rely on title casing to match the canonical list mostly.
        c_norm = c.strip()
        # Handle special casing like "Newcastle-upon-Tyne" vs "Newcastle-Upon-Tyne"
        # Let's simple title() for now but be aware of hyphens
        # c.title() makes "Newcastle-Upon-Tyne"
        
        # Better normalization: match canonical list if possible
        # For now, let's just use the string as is from DB if it's clean, or fallback to Title.
        c_norm = c.strip()
        
        counts[c_norm][t] += 1
        # Also add title cased version to cover variations
        counts[c_norm.title()][t] += 1
        
        cities_seen.add(c_norm)

print(f"DB Cities Found: {len(cities_seen)} unique strings")

# Load Canonical Cities to verify coverage
with open(r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts", 'r', encoding='utf-8') as f:
    content = f.read()
    matches = re.findall(r'^\s*"([^"]+)":\s*"', content, re.MULTILINE)
    canon_cities = sorted([c for c in matches]) # Keep original case for report

print("\n--- COVERAGE DEPTH REPORT (> 30 cities sample) ---")
print("Threshold: 9 listings\n")

missing_any_listings = []
low_listings = [] # < 9

for city in canon_cities:
    city_counts = counts.get(city, {}) # Match by title case usually
    
    # If not found directly, try lookup case insensitive
    if not city_counts:
        # find matching key
        for k in counts.keys():
            if k.lower() == city.lower():
                city_counts = counts[k]
                break
    
    print(f"CITY: {city}")
    for trade in TRADES:
        n = city_counts.get(trade, 0)
        status = "OK" if n >= 9 else "LOW"
        if n == 0: status = "EMPTY"
        
        if n < 9:
            print(f"  - {trade}: {n} [{status}]")
            if n == 0:
                missing_any_listings.append(f"{city} - {trade}")
            else:
                low_listings.append(f"{city} - {trade} ({n})")

print("\n--- SUMMARY ---")
print(f"Total Canonical Cities: {len(canon_cities)}")
print(f"Total Empty Slots (0 listings): {len(missing_any_listings)}")
print(f"Total Low Slots (1-8 listings): {len(low_listings)}")

if len(missing_any_listings) > 0:
    print("\nTop Empty Slots:")
    for s in missing_any_listings[:20]:
        print("  " + s)

print("\nDone.")
