
import os
from supabase import create_client, Client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith("VITE_SUPABASE_URL="):
                url = line.split('=', 1)[1].strip()
            elif line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

# Verified Listings for North West Expansion (St Helens, Bury, Southport)
listings = [
    # St Helens
    {"business_name": "St Helens Plumbers", "trade": "plumber", "city": "St Helens", "country_code": "GB", "phone": "01744 411 447", "description": "24/7 emergency plumbing specialists.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Express Local St Helens Electricians", "trade": "electrician", "city": "St Helens", "country_code": "GB", "phone": "0344 947 0956", "description": "Premier 24-hour emergency electrical repair.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "Merseyside"},
    
    # Bury
    {"business_name": "M Plumbing", "trade": "plumber", "city": "Bury", "country_code": "GB", "phone": "0161 660 7522", "description": "24/7 emergency plumbing in Bury.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Greater Manchester"},
    {"business_name": "KHL Electrical Contractor", "trade": "electrician", "city": "Bury", "country_code": "GB", "phone": "07458 947688", "description": "24/7 electrical call-out service.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Greater Manchester"},
    {"business_name": "K2 Heating & Cooling", "trade": "hvac", "city": "Bury", "country_code": "GB", "phone": "0161 804 4561", "description": "24/7 emergency AC and heating repair.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Greater Manchester"},

    # Southport
    {"business_name": "Southport Plumbers", "trade": "plumber", "city": "Southport", "country_code": "GB", "phone": "01704 331 266", "description": "Quick response emergency plumbers.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Merseyside"},
    {"business_name": "Southport Electrical Services", "trade": "electrician", "city": "Southport", "country_code": "GB", "phone": "01704 509776", "description": "24 hour emergency electrician.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Merseyside"}
]

print(f"Inserting {len(listings)} Verified North West listings...")

for b in listings:
    # Check for existing by number to prevent dupes
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
