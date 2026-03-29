
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

new_listings = [
    {
        "business_name": "Able Group (Accrington)",
        "trade": "plumber",
        "city": "Accrington",
        "country_code": "GB",
        "phone": "01254 783 889",
        "rating": 4.8,
        "is_24_7": True,
        "verified": True,
        "description": "Professional 24/7 emergency plumbing response in Accrington. 30-90 minute typical arrival.",
        "state": "Lancashire"
    },
    {
        "business_name": "AS Heat",
        "trade": "plumber",
        "city": "Accrington",
        "country_code": "GB",
        "phone": "01254 241625",
        "rating": 4.9,
        "is_24_7": True,
        "verified": True,
        "description": "Local Accrington emergency plumbers available 7 days a week.",
        "state": "Lancashire"
    },
    {
        "business_name": "EPHG Limited",
        "trade": "electrician",
        "city": "Accrington",
        "country_code": "GB",
        "phone": "07720247247",
        "rating": 4.7,
        "is_24_7": True,
        "verified": True,
        "description": "24 hour emergency electrician covering Accrington and surrounding areas.",
        "state": "Lancashire"
    },
    {
        "business_name": "Able Group Electrical",
        "trade": "electrician",
        "city": "Accrington",
        "country_code": "GB",
        "phone": "0800 114 3313",
        "rating": 4.8,
        "is_24_7": True,
        "verified": True,
        "description": "Fast response emergency electricians in Accrington. No call-out charge.",
        "state": "Lancashire"
    }
]

print(f"adding {len(new_listings)} listings...")

for listing in new_listings:
    # Check if exists to avoid dupes
    existing = supabase.table('businesses').select('*').eq('phone', listing['phone']).execute()
    if not existing.data:
        res = supabase.table('businesses').insert(listing).execute()
        print(f"Inserted: {listing['business_name']}")
    else:
        print(f"Skipped (Exists): {listing['business_name']}")
