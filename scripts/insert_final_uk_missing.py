
import json
import os
import re
import uuid
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

REPORT_FILE = "uk_missing_data_report.json"

try:
    with open(REPORT_FILE, "r", encoding="utf-8") as f:
        listings = json.load(f)
except Exception as e:
    print(f"Error loading report: {e}")
    exit(1)

print(f"Loaded {len(listings)} listings to process.")

success_count = 0
skip_count = 0

for item in listings:
    name = item.get("name")
    phone = item.get("phone")
    trade = item.get("trade")
    city = item.get("city")
    filename = item.get("file", "").lower()

    if not name or not phone:
        print(f"Skipping invalid item: {item}")
        continue

    # Infer trade if unknown
    if trade == "unknown" or not trade:
        if "hvac" in filename:
            trade = "hvac"
        elif "plumber" in filename:
            trade = "plumber"
        elif "electrician" in filename:
            trade = "electrician"
        elif "water" in filename:
            trade = "water-restoration"
        elif "breakdown" in filename:
            trade = "breakdown-recovery"
        elif "gas" in filename:
            trade = "hvac" # broadly
        elif "lock" in filename:
            trade = "locksmith"
        elif "glass" in filename or "glaz" in filename:
            trade = "glazier"
        elif "roof" in filename:
            trade = "roofer"
        elif "build" in filename:
            trade = "builder"
        else:
            print(f"Could not infer trade for {filename}. Skipping.")
            continue

    # Prepare payload
    try:
        # Check existence one last time
        res = supabase.table('businesses').select('id').eq('phone', phone).execute()
        if res.data:
            print(f"  Item already exists: {name} ({phone})")
            skip_count += 1
            continue

        slug_base = f"{name} {city}".lower().replace(' ', '-').replace('&', 'and').replace('.', '').replace('(', '').replace(')', '')
        slug = re.sub(r'[^a-z0-9-]', '', slug_base)
        
        # Ensure verified
        payload = {
            "id": str(uuid.uuid4()),
            "name": name,
            "trade": trade,
            "city": city, # stored as lower in script, but DB expects proper case? 
                          # Actually DB seems to handle case, but best to title case if possible or match existing conventions.
                          # Most entries are Title Case.
            "slug": slug,
            "phone": phone,
            "country_code": "GB",
            "is_open_24_hours": True, # Assume true for "real" emergency data files
            "verified": True,
            "tier": "basic"
        }
        
        # Fix city casing? "derby" -> "Derby"
        # We can map it if we really want, or just verify Title Case.
        payload["city"] = city.title().replace(" And ", " & ").replace("-On-", "-on-").replace("-Upon-", "-upon-") # simple heuristic
        if payload["city"] == "Stoke-on-trent": payload["city"] = "Stoke-on-Trent"
        if payload["city"] == "Newcastle-upon-tyne": payload["city"] = "Newcastle-upon-Tyne"

        supabase.table('businesses').insert(payload).execute()
        print(f"  + Inserted: {name} ({trade} in {payload['city']})")
        success_count += 1
        
    except Exception as e:
        print(f"  ! Error inserting {name}: {e}")

print(f"Done. Inserted: {success_count}, Skipped: {skip_count}")
