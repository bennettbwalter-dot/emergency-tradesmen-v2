
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

# Verified Tier 3 Listings (Roofer, Builder, Water, Breakdown) for Phase 3 Hubs
# STRICT FILTER: UK Only. No US.
listings = [
    # Dover (UK)
    {"name": "1st Car Recovery", "trade": "breakdown", "city": "Dover", "country_code": "GB", "phone": "07454 763786", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Kent"},
    {"name": "Kent Recovery", "trade": "breakdown", "city": "Dover", "country_code": "GB", "phone": "01227 250157", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Kent"},
    # Skipped Dover Roofer/Water (US Contamination in search results)

    # Folkestone (UK)
    {"name": "Fairview Folkestone Roofing", "trade": "roofer", "city": "Folkestone", "country_code": "GB", "phone": "01303 476263", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Kent"},
    {"name": "Hythe & Folkestone Roofers", "trade": "roofer", "city": "Folkestone", "country_code": "GB", "phone": "07947 927293", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Kent"},
    {"name": "Reds Recovery Services", "trade": "breakdown", "city": "Folkestone", "country_code": "GB", "phone": "01634 926801", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Kent"},
    {"name": "W. Morgan & Daughters", "trade": "breakdown", "city": "Folkestone", "country_code": "GB", "phone": "01304 804561", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Kent"},

    # Great Yarmouth (UK)
    {"name": "Emergency Roofers Great Yarmouth", "trade": "roofer", "city": "Great Yarmouth", "country_code": "GB", "phone": "01493 688022", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "B. Porter Roofing Contractor", "trade": "roofer", "city": "Great Yarmouth", "country_code": "GB", "phone": "01493 663386", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "JLM Auto Services", "trade": "breakdown", "city": "Great Yarmouth", "country_code": "GB", "phone": "01493 445744", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "Reflex Auto Services", "trade": "breakdown", "city": "Great Yarmouth", "country_code": "GB", "phone": "01493 803985", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "Great Yarmouth Heater", "trade": "water-restoration", "city": "Great Yarmouth", "country_code": "GB", "phone": "01493 738147", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},

    # King's Lynn (UK)
    {"name": "Kings Lynn Roofers", "trade": "roofer", "city": "King's Lynn", "country_code": "GB", "phone": "01553 603644", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Norfolk"},
    # "Emergency Roofers" (01553 373053) - verified.
    {"name": "Emergency Roofers King's Lynn", "trade": "roofer", "city": "King's Lynn", "country_code": "GB", "phone": "01553 373053", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "Tears Recovery", "trade": "breakdown", "city": "King's Lynn", "country_code": "GB", "phone": "01553 660922", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "A Plus Recovery", "trade": "breakdown", "city": "King's Lynn", "country_code": "GB", "phone": "07778 996679", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},
    {"name": "Kings Lynn Emergency Plumbing", "trade": "water-restoration", "city": "King's Lynn", "country_code": "GB", "phone": "0333 996 4444", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Norfolk"},

    # Corby (UK)
    {"name": "Automotive Solutions Corby Ltd", "trade": "breakdown", "city": "Corby", "country_code": "GB", "phone": "01536 601236", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Northamptonshire"},
    {"name": "Rapid Recovery Corby", "trade": "breakdown", "city": "Corby", "country_code": "GB", "phone": "07598 314366", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Northamptonshire"},
]

print(f"Inserting {len(listings)} Verified Tier 3 listings for Phase 3...")

for b in listings:
    existing = supabase.table('businesses').select('*').eq('phone', b['phone']).eq('city', b['city']).execute()
    if not existing.data:
        try:
            supabase.table('businesses').insert(b).execute()
            print(f"  + Added: {b['name']} ({b['city']})")
        except Exception as e:
            print(f"  ! Error: {e}")
    else:
        print(f"  . Exists: {b['name']} ({b['city']})")

print("Done.")
