
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
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching one record to check schema keys...")
try:
    res = supabase.table('businesses').select('*').limit(1).execute()
    if res.data:
        record = res.data[0]
        print("Keys found:", list(record.keys()))
    else:
        print("No data found in table.")
except Exception as e:
    print(f"Error: {e}")
