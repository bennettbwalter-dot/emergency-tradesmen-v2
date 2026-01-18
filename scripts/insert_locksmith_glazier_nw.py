
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

# Verified Locksmith & Glazier Listings for North West Hubs
listings = [
    # Blackburn
    {"business_name": "Blackburn Glass & Glaziers", "trade": "glazier", "city": "Blackburn", "country_code": "GB", "phone": "01254 476540", "description": "24/7 emergency glass repair.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Lancashire"},
    {"business_name": "LockFit Blackburn", "trade": "locksmith", "city": "Blackburn", "country_code": "GB", "phone": "01254 377955", "description": "Local expert locksmith.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Lancashire"},

    # St Helens
    {"business_name": "St Helens Glazing", "trade": "glazier", "city": "St Helens", "country_code": "GB", "phone": "01744 582377", "description": "Emergency boarding and glazing.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Lockforce Locksmiths St Helens", "trade": "locksmith", "city": "St Helens", "country_code": "GB", "phone": "01744 358034", "description": "24/7 emergency locksmith.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Merseyside"},

    # Southport
    {"business_name": "Express Southport Glaziers", "trade": "glazier", "city": "Southport", "country_code": "GB", "phone": "0344 947 0955", "description": "24 hour glass replacement.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Lockforce Southport", "trade": "locksmith", "city": "Southport", "country_code": "GB", "phone": "01704 207016", "description": "Emergency lock repairs.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Merseyside"},

    # Bury (Glazier found, Locksmith pending next step)
    {"business_name": "Glass Repairs Manchester (Bury)", "trade": "glazier", "city": "Bury", "country_code": "GB", "phone": "0161 694 6202", "description": "Emergency glazing in Bury.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Greater Manchester"},
]

print(f"Inserting {len(listings)} Verified Locksmith/Glazier listings...")

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
