
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

supabase: Client = create_client(url, key)

print("--- DEBUG: ABERDEEN ---")

# 1. Check Exact Match
res = supabase.table('businesses').select('id, name, trade, city').eq('city', 'Aberdeen').eq('country_code', 'GB').execute()
print(f"Exact 'Aberdeen' Count: {len(res.data)}")
for r in res.data[:5]:
    print(f"  {r['trade']}: {r['name']}")

# 2. Check Case Insensitive
res = supabase.table('businesses').select('id, name, trade, city').ilike('city', 'aberdeen').eq('country_code', 'GB').execute()
print(f"Ilike 'aberdeen' Count: {len(res.data)}")

# 3. Check Plumber specifically
res = supabase.table('businesses').select('id, name, trade').eq('city', 'Aberdeen').eq('trade', 'plumber').execute()
print(f"Exact 'Aberdeen' + 'plumber' Count: {len(res.data)}")
