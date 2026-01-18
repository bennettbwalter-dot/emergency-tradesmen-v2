
import os
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

# Verified Roofer, Builder, Water, Breakdown Listings for North West Hubs
listings = [
    # Blackburn
    {"business_name": "Crown Roofing and Building", "trade": "roofer", "city": "Blackburn", "country_code": "GB", "phone": "07455 607702", "description": "Emergency roofing repairs.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Lancashire"},
    {"business_name": "Blackburn Car Recovery", "trade": "breakdown", "city": "Blackburn", "country_code": "GB", "phone": "07944 040506", "description": "24/7 Breakdown recovery.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Lancashire"},
    # Builder: Finest Builder Services (Check phone or skip if national generic) - skipped to be safe.

    # St Helens
    {"business_name": "Alpine Roofing UK", "trade": "roofer", "city": "St Helens", "country_code": "GB", "phone": "01744 340360", "description": "Emergency roof repairs.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
    # Skipped Breakdown for St Helens (ambiguous local vs national in snippets).

    # Bury
    {"business_name": "Daniel Roofing And Guttering", "trade": "roofer", "city": "Bury", "country_code": "GB", "phone": "0161 410 2060", "description": "24/7 Emergency roofing.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Greater Manchester"},
    {"business_name": "Zaman Recovery", "trade": "breakdown", "city": "Bury", "country_code": "GB", "phone": "0161 531 3564", "description": "24/7 Vehicle recovery.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Greater Manchester"},
    {"business_name": "Entire Building Services", "trade": "builder", "city": "Bury", "country_code": "GB", "phone": "07707 699666", "description": "24/7 Building services.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "Greater Manchester"},

    # Southport
    {"business_name": "Rapid Response Roofing 24/7", "trade": "roofer", "city": "Southport", "country_code": "GB", "phone": "01704 627038", "description": "Rapid roofing response.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Scrubbed With Love", "trade": "water-restoration", "city": "Southport", "country_code": "GB", "phone": "01704 500636", "description": "Flood damage restoration.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Car Recovery Southport", "trade": "breakdown", "city": "Southport", "country_code": "GB", "phone": "07459 367285", "description": "Emergency car recovery.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
]

print(f"Inserting {len(listings)} Verified listings for North West batch 2...")

for b in listings:
    existing = supabase.table('businesses').select('*').eq('phone', b['phone']).eq('city', b['city']).execute()
    if not existing.data:
        try:
            supabase.table('businesses').insert(b).execute()
            print(f"  + Added: {b['business_name']} ({b['city']})")
        except Exception as e:
            print(f"  ! Error: {e}")
    else:
        print(f"  . Exists: {b['business_name']} ({b['city']})")

print("Done.")
