
import os
import uuid
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

listings = [
    # St Albans
    {"name": "Emergency Plumbers St Albans", "trade": "plumber", "city": "St Albans", "country_code": "GB", "phone": "01727 789445", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "St Albans Plumbers 24/7", "trade": "plumber", "city": "St Albans", "country_code": "GB", "phone": "01727 640175", "rating": 4.9, "is_open_24_hours": True, "verified": True},
    {"name": "Electric Master", "trade": "electrician", "city": "St Albans", "country_code": "GB", "phone": "01727 572285", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "St Albans Plumbing Electrical Ltd", "trade": "electrician", "city": "St Albans", "country_code": "GB", "phone": "01727 309902", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "St Albans Plumbing Electrical Ltd", "trade": "gas-engineer", "city": "St Albans", "country_code": "GB", "phone": "01727 309902", "rating": 4.8, "is_open_24_hours": True, "verified": True}, # Dual trade
    {"name": "Locksmith St Albans", "trade": "locksmith", "city": "St Albans", "country_code": "GB", "phone": "01727 380229", "rating": 4.9, "is_open_24_hours": True, "verified": True},
    {"name": "AL Locksmith", "trade": "locksmith", "city": "St Albans", "country_code": "GB", "phone": "01727 624813", "rating": 4.8, "is_open_24_hours": True, "verified": True},

    # Worthing
    {"name": "North Plumbing and Heating", "trade": "plumber", "city": "Worthing", "country_code": "GB", "phone": "01903 910685", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "North Plumbing and Heating", "trade": "gas-engineer", "city": "Worthing", "country_code": "GB", "phone": "01903 910685", "rating": 4.8, "is_open_24_hours": True, "verified": True}, # Dual trade
    {"name": "Southern Thermal", "trade": "plumber", "city": "Worthing", "country_code": "GB", "phone": "01903 570771", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Able Group", "trade": "electrician", "city": "Worthing", "country_code": "GB", "phone": "01903 371718", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Emergency Electrician Services", "trade": "electrician", "city": "Worthing", "country_code": "GB", "phone": "07539 417962", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Capital Locksmiths", "trade": "locksmith", "city": "Worthing", "country_code": "GB", "phone": "01903 231 544", "rating": 4.9, "is_open_24_hours": True, "verified": True},
    {"name": "LockRite Worthing", "trade": "locksmith", "city": "Worthing", "country_code": "GB", "phone": "01903 927021", "rating": 4.8, "is_open_24_hours": True, "verified": True},

    # Crawley
    {"name": "Dyno-Rod Plumbing Crawley", "trade": "plumber", "city": "Crawley", "country_code": "GB", "phone": "01293 731 062", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Eco Tec Ltd", "trade": "plumber", "city": "Crawley", "country_code": "GB", "phone": "01293 665319", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Fast Heat", "trade": "plumber", "city": "Crawley", "country_code": "GB", "phone": "01293 853640", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Fast Heat", "trade": "gas-engineer", "city": "Crawley", "country_code": "GB", "phone": "01293 853640", "rating": 4.8, "is_open_24_hours": True, "verified": True}, # Dual trade
    {"name": "TES Compliance", "trade": "electrician", "city": "Crawley", "country_code": "GB", "phone": "01293 912 318", "rating": 4.9, "is_open_24_hours": True, "verified": True},
    {"name": "247 Electrician Crawley", "trade": "electrician", "city": "Crawley", "country_code": "GB", "phone": "01293 344952", "rating": 4.8, "is_open_24_hours": True, "verified": True},
    {"name": "Knox Locks", "trade": "locksmith", "city": "Crawley", "country_code": "GB", "phone": "01293 972572", "rating": 4.9, "is_open_24_hours": True, "verified": True},
    {"name": "LockRite Crawley", "trade": "locksmith", "city": "Crawley", "country_code": "GB", "phone": "01293 225277", "rating": 4.8, "is_open_24_hours": True, "verified": True},
]

print(f"Inserting {len(listings)} verified listings for Empty UK Towns...")

for b in listings:
    # Check duplicate
    existing = supabase.table('businesses').select('*').eq('phone', b['phone']).eq('city', b['city']).eq('trade', b['trade']).execute()
    if not existing.data:
        try:
            # Force UUID
            b['id'] = str(uuid.uuid4())
            
            # Generate Slug
            slug_base = f"{b['name']} {b['city']}".lower().replace(' ', '-').replace('&', 'and').replace('.', '')
            b['slug'] = re.sub(r'[^a-z0-9-]', '', slug_base)
            
            supabase.table('businesses').insert(b).execute()
            print(f"  + Added: {b['name']} ({b['trade']} in {b['city']})")
        except Exception as e:
            print(f"  ! Error: {e}")
    else:
        print(f"  . Exists: {b['name']} ({b['trade']})")

print("Done.")
