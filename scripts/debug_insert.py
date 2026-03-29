
import os
import json
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
except Exception as e:
    print(f"Error reading .env: {e}")

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

# Test Data - Minimal with 'name' instead of 'business_name'
test_listing_minimal = {
    "name": "DEBUG TEST Glaziers Minimal", 
    "trade": "glazier", 
    "city": "Great Yarmouth", 
    "phone": "01493 888888"
}

print("Attempting minimal insert (name, trade, city, phone)...")
try:
    data = supabase.table('businesses').insert(test_listing_minimal).execute()
    print("Minimal Insert SUCCESS!")
except Exception as e:
    print("Minimal Insert FAILED.")
    print(f"Error: {e}")

# Test Data - Full (checking 'state', 'country_code', 'is_24_7', 'verified')
test_listing_full = {
    "name": "DEBUG TEST Glaziers Full", 
    "trade": "glazier", 
    "city": "Great Yarmouth", 
    "country_code": "GB", 
    "phone": "01493 999999", 
    "description": "Debug insert test full.", 
    "rating": 5.0, 
    "is_24_7": True, 
    "verified": True, 
    "state": "Norfolk"
}

print("\nAttempting full insert...")
try:
    data = supabase.table('businesses').insert(test_listing_full).execute()
    print("Full Insert SUCCESS!")
except Exception as e:
    print("Full Insert FAILED.")
    if hasattr(e, 'message'):
        print(f"Message: {e.message}")
    else:
        print(f"Error: {e}")
