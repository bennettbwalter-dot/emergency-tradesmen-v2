
import os
import json
import re
from supabase import create_client, Client

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

# Valid trades from trades.ts
VALID_TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown-recovery", "hvac"
    # Note: DB might use 'breakdown-recovery' or 'breakdown'? 
    # trades.ts says slug: "breakdown", name "Breakdown Recovery".
    # But files might have used full name. Check consistency.
]
# Correction: verify the actual slugs used in DB.
# trades.ts line 11 says slug: "breakdown".
# But my previous imports might have used "breakdown-recovery". 
# The script `insert_final_uk_missing.py` used: `trade = "breakdown-recovery"`! 
# This is a potential Mismatch!
# If the app expects "breakdown" but DB has "breakdown-recovery", it might fail to load.

# Let's check what the App expects.
# TradeCityPage.tsx uses generateTradePageData.
# generateTradePageData (line 194) searches trades by slug.
# So if the URL is /emergency-breakdown (slug="breakdown"), it looks for businesses with trade="breakdown"? 
# Actually, the page usually filters businesses by trade slug?
# Let's check TradeCityPage.tsx data fetching logic.

# Fetch all UK businesses with pagination
all_rows = []
start = 0
limit = 1000

while True:
    print(f"Fetching {start}-{start+limit}...")
    res = supabase.table('businesses').select('id, name, trade, city, slug').eq('country_code', 'GB').range(start, start + limit - 1).execute()
    data = res.data
    if not data:
        break
    all_rows.extend(data)
    start += limit

print(f"Loaded {len(all_rows)} TOTAL UK businesses.")

invalid_trades = []
breakdown_mismatch = []

# Load Canonical Cities
with open(r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts", 'r', encoding='utf-8') as f:
    content = f.read()
    matches = re.findall(r'^\s*"([^"]+)":\s*"', content, re.MULTILINE)
    canon_cities = set([c.lower() for c in matches])

known_slugs = {
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
}

for row in all_rows:
    t = row.get('trade')
    
    if t == "breakdown-recovery":
        breakdown_mismatch.append(row)
        
    if t not in known_slugs and t != "breakdown-recovery": # Track others separately
        invalid_trades.append(row)

print(f"Found {len(breakdown_mismatch)} rows with 'breakdown-recovery' (should be 'breakdown').")
print(f"Found {len(invalid_trades)} rows with OTHER invalid slugs.")

if breakdown_mismatch:
    print("Fixing breakdown-recovery slugs...")
    for row in breakdown_mismatch:
        supabase.table('businesses').update({"trade": "breakdown"}).eq("id", row['id']).execute()
        print(f"  Fixed: {row['name']}")
        
if invalid_trades:
    for r in invalid_trades[:10]:
        print(f"  Invalid: {r['trade']} -> {r['name']}")
