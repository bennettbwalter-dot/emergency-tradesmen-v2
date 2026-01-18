
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

# 1. Get List of UK Cities
print("Fetching UK Cities from cityPostcodes.ts...")
uk_cities = []
try:
    with open(r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts", 'r', encoding='utf-8') as f:
        content = f.read()
        matches = re.findall(r'^\s*"([^"]+)":\s*"', content, re.MULTILINE)
        uk_cities = [c.lower() for c in matches]
except Exception as e:
    print(f"Error reading cityPostcodes.ts: {e}")
    exit(1)

uk_cities = list(set(uk_cities))
print(f"Loaded {len(uk_cities)} UK city targets.")

# 2. Scan scripts/ for potential matches
scripts_dir = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts"
candidates = []
all_listings = [] # Store tuple of (phone, original_item)

print("Scanning files...")
for filename in os.listdir(scripts_dir):
    if not filename.endswith(".json"):
        continue
    
    name_lower = filename.lower()
    
    matched_city = None
    for city in uk_cities:
        pattern = city.replace(' ', '[_\\-]?').replace('-', '[_\\-]?')
        if re.search(pattern, name_lower):
            matched_city = city
            break
            
    if matched_city:
        filepath = os.path.join(scripts_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if isinstance(data, dict):
                if "listings" in data:
                    data = data["listings"]
                else:
                    data = [data]
            elif not isinstance(data, list):
                continue
            
            for entry in data:
                phone = entry.get('phone') or entry.get('phoneNumber')
                name = entry.get('name') or entry.get('businessName') or entry.get('title')
                
                if phone and name:
                     clean_phone = re.sub(r'[^0-9]', '', str(phone))
                     # Strict UK check: must start with 0, length 10 or 11
                     if clean_phone.startswith('0') and 9 <= len(clean_phone) <= 12:
                         all_listings.append({
                             "phone": phone, # Keep original strictly for DB lookup? DB might be formatted.
                             # Actually DB usually stores as is or somewhat normalized. 
                             # We should normalized phones in memory for query if possible?
                             # Let's collect ALL phones and query exact string first.
                             "clean_phone": clean_phone,
                             "data": entry,
                             "file": filename,
                             "city": matched_city
                         })
        except:
            pass

print(f"Collected {len(all_listings)} potential UK listings candidates from files.")

if len(all_listings) == 0:
    print("No listings found.")
    exit(0)

# 3. Batch Check against DB
# DB might store format differently "0123 456 789" vs "0123456789".
# Best way is to fetch ALL businesses phones from DB?
# If DB has 10k rows, that's fine. Supabase usually limits to 1000.
# We will use pagination to fetch ALL phone numbers from DB once.

print("Fetching existing DB phones...")
existing_phones = set()

start = 0
limit = 1000
while True:
    print(f"  Fetching {start}-{start+limit}...")
    # Only fetch phones to save bandwidth
    res = supabase.table('businesses').select('phone').range(start, start + limit - 1).execute()
    if not res.data:
        break
    
    for row in res.data:
        p = row.get('phone')
        if p:
            # Store both raw and cleaned in set for easy lookup
            existing_phones.add(p)
            existing_phones.add(re.sub(r'[^0-9]', '', p))
            
    start += limit
    if len(res.data) < limit:
        break

print(f"Loaded {len(existing_phones)} existing phone identifiers from DB.")

# 4. Filter
missing_listings = []
for item in all_listings:
    p = item['phone']
    cp = item['clean_phone']
    
    if p not in existing_phones and cp not in existing_phones:
        missing_listings.append(item)

# 5. Report
print(f"--- RESULTS ---")
print(f"Total verified UK listings found in files but MISSING in DB: {len(missing_listings)}")

if len(missing_listings) > 0:
    # Save detailed report
    report_data = [
        {
            "name": m['data'].get('name') or m['data'].get('businessName'),
            "phone": m['phone'],
            "trade": m['data'].get('trade', 'unknown'),
            "city": m['city'],
            "file": m['file']
        }
        for m in missing_listings
    ]
    with open("uk_missing_data_report.json", "w", encoding="utf-8") as f:
        json.dump(report_data, f, indent=2)
    print("Saved candidates to uk_missing_data_report.json")
    
    # Print distinct count by city
    city_counts = {}
    for m in missing_listings:
        c = m['city']
        city_counts[c] = city_counts.get(c, 0) + 1
    
    print("Missing counts by city (Top 10):")
    sorted_counts = sorted(city_counts.items(), key=lambda x: x[1], reverse=True)
    for c, n in sorted_counts[:10]:
        print(f"  {c}: {n}")
else:
    print("No missing verified UK listings found.")
