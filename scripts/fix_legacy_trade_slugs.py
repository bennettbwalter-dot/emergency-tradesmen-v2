
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

MAPPINGS = {
    "emergency-plumber": "plumber",
    "emergency-electrician": "electrician",
    "emergency-locksmith": "locksmith",
    "emergency-glazier": "glazier",
    "emergency-roofer": "roofer",
    "emergency-builder": "builder",
    "emergency-hvac": "hvac",
    "emergency-gas-engineer": "gas-engineer",
    "roofing-contractor": "roofer",
    "roofing": "roofer",
    "breakdown-recovery": "breakdown" # Just in case any slipped through
}

print("Fixing Legacy Slugs...")

count = 0
for old, new in MAPPINGS.items():
    # Update where trade matches old and country is GB (safety first)
    res = supabase.table('businesses').update({"trade": new}).eq('trade', old).eq('country_code', 'GB').execute()
    # Postgrest response format for update usually includes data
    if res.data:
        n = len(res.data)
        if n > 0:
            print(f"  Fixed {n} rows from '{old}' to '{new}'")
            count += n

print(f"Total fixed: {count}")
