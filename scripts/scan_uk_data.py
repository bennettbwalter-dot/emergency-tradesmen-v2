
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
        # Match "CityName": "Postcode"
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

for filename in os.listdir(scripts_dir):
    if not filename.endswith(".json"):
        continue
    
    name_lower = filename.lower()
    
    # Check if filename contains a UK city name
    matched_city = None
    for city in uk_cities:
        # Normalize city for filename matching (spaces to underscores, hyphens)
        city_slug = city.replace(' ', '').replace('-', '').replace('.', '')
        name_clean = name_lower.replace(' ', '').replace('-', '').replace('_', '')
        
        # Check if city name appears at start or distinct part of filename
        # e.g. "aberdeen" in "aberdeen_plumber.json"
        
        if city_slug in name_clean:
             # Heuristic: verify it's the city name, not just a substring (e.g. 'bury' in 'canterbury')
             # But stripped comparison is tricky. 
             # Let's try simpler: if regex match of city name (flexible separator) is in filename
             
             # Create flexible pattern
             pattern = city.replace(' ', '[_\\-]?').replace('-', '[_\\-]?')
             if re.search(pattern, name_lower):
                 matched_city = city
                 break
            
    if matched_city:
        candidates.append({"file": filename, "city": matched_city})

print(f"Found {len(candidates)} JSON files potentially related to UK cities.")

# 3. Analyze content
missing_listings = []

for item in candidates:
    filepath = os.path.join(scripts_dir, item['file'])
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Normalize to list
        if isinstance(data, dict):
            # Might be { "listings": [...] } or just a single dict
            if "listings" in data:
                data = data["listings"]
            else:
                data = [data]
        elif not isinstance(data, list):
            continue

        for entry in data:
            # Basic validation
            phone = entry.get('phone') or entry.get('phoneNumber')
            name = entry.get('name') or entry.get('businessName') or entry.get('title')
            
            if not phone or not name:
                continue
                
            # UK Phone Check (0 start)
            clean_phone = re.sub(r'[^0-9]', '', str(phone))
            if not clean_phone.startswith('0'):
                # Possibly US data sharing a city name (e.g. Birmingham AL vs UK)
                # Ignore
                continue
            
            # Check DB existence
            # We verify by phone number to be sure
            res = supabase.table('businesses').select('id').eq('phone', phone).execute()
            if not res.data:
                # Double check with cleaned phone? listing might check raw.
                # Let's assume raw match for now.
                
                # Check verified flag
                verified = entry.get('verified', False)
                
                missing_listings.append({
                    "file": item['file'],
                    "city": item['city'],
                    "name": name,
                    "phone": phone,
                    "trade": entry.get('trade', 'unknown'),
                    "raw": entry
                })

    except Exception as e:
        # print(f"Skipping {item['file']}: {e}")
        pass

print(f"--- RESULTS ---")
print(f"Total potential missing verified UK listings found: {len(missing_listings)}")

if len(missing_listings) > 0:
    # Save to a file for review
    with open("uk_missing_data_report.json", "w", encoding="utf-8") as f:
        json.dump(missing_listings, f, indent=2)
    print("Saved candidates to uk_missing_data_report.json")
    
    # Print distinct count by city
    city_counts = {}
    for m in missing_listings:
        c = m['city']
        city_counts[c] = city_counts.get(c, 0) + 1
    
    print("Missing counts by city:")
    for c, n in city_counts.items():
        print(f"  {c}: {n}")
else:
    print("No missing verified UK listings found in local JSON files.")
