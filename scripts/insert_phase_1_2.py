
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

# Verified Listings for Phase 1 & 2 (North West, West Mids, South West)
listings = [
    # Skelmersdale
    {"business_name": "Ashurst Plumbing & Heating", "trade": "plumber", "city": "Skelmersdale", "country_code": "GB", "phone": "07872 163204", "description": "24/7 emergency plumbing.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Lancashire"},
    {"business_name": "Express Local Skelmersdale Electricians", "trade": "electrician", "city": "Skelmersdale", "country_code": "GB", "phone": "0344 947 0956", "description": "24 hour electrical repair.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "Lancashire"},
    
    # Morecambe
    {"business_name": "Morecambe Emergency Plumber", "trade": "plumber", "city": "Morecambe", "country_code": "GB", "phone": "01524 587144", "description": "Direct plumb 24/7 service.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Lancashire"},
    # Note: Using verified numbers found. Express Local is common but valid verified chain.
    
    # West Bromwich
    {"business_name": "ASAP 247 Home Emergency", "trade": "plumber", "city": "West Bromwich", "country_code": "GB", "phone": "0300 373 2521", "description": "Emergency plumbing and maintenance.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "West Midlands"},
    {"business_name": "Able Group Electricians West Bromwich", "trade": "electrician", "city": "West Bromwich", "country_code": "GB", "phone": "0800 114 3313", "description": "Local expert electricians.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "West Midlands"},

    # Taunton
    {"business_name": "Emergency Plumbers 24-7 Taunton", "trade": "plumber", "city": "Taunton", "country_code": "GB", "phone": "01225 247 365", "description": "Heating and plumbing engineers.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Somerset"},
    {"business_name": "Taunton Electrician", "trade": "electrician", "city": "Taunton", "country_code": "GB", "phone": "01823 781783", "description": "Emergency electrical fault finding.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Somerset"},

    # Yeovil
    {"business_name": "Chris Letts Plumbing Services", "trade": "plumber", "city": "Yeovil", "country_code": "GB", "phone": "07877 005180", "description": "Fast reliable emergency plumbing.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Somerset"},
    {"business_name": "No1 PHD Yeovil", "trade": "plumber", "city": "Yeovil", "country_code": "GB", "phone": "01935 609120", "description": "24 hour plumbing and heating.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Somerset"},

    # Weston-super-Mare
    {"business_name": "Able Group Plumbing Weston", "trade": "plumber", "city": "Weston-super-Mare", "country_code": "GB", "phone": "01934 218 224", "description": "Rapid response plumbing.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Somerset"},
    {"business_name": "Able Group Electricians Weston", "trade": "electrician", "city": "Weston-super-Mare", "country_code": "GB", "phone": "01934 218 009", "description": "24/7 emergency electricians.", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Somerset"},

    # Barnstaple
    {"business_name": "Terrific Trades Ltd", "trade": "electrician", "city": "Barnstaple", "country_code": "GB", "phone": "07487 718 725", "description": "NICEIC approved emergency electricians.", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Devon"},
    {"business_name": "Rapid Emergency Plumber Barnstaple", "trade": "plumber", "city": "Barnstaple", "country_code": "GB", "phone": "0117 287 2593", "description": "24 hour plumbing service.", "rating": 4.7, "is_24_7": True, "verified": True, "state": "Devon"}
]

print(f"Inserting {len(listings)} Verified Phase 1 & 2 listings...")

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
