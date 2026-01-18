
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

print("--- Inspect Dover Record ---")
res = supabase.table('businesses').select('*').eq('city', 'Dover').limit(1).execute()
if res.data:
    row = res.data[0]
    print(f"Keys in DB: {list(row.keys())}")
    print(f"is_24_7 value: {row.get('is_24_7')}")
    print(f"isOpen24Hours value: {row.get('isOpen24Hours')}")
else:
    print("No Dover records found.")
print("----------------------------")
