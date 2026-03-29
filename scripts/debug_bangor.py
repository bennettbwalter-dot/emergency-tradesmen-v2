
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

supabase: Client = create_client(url, key)

print("--- DEBUGGING BANGOR ---")

# Check 'Bangor'
res1 = supabase.table('businesses').select('*', count='exact').eq('city', 'Bangor').execute()
print(f"Listings for 'Bangor': {res1.count}")
if res1.data:
    print("Sample 'Bangor':", res1.data[0]['name'], res1.data[0]['trade'])

# Check 'Bangor (Wales)'
res2 = supabase.table('businesses').select('*', count='exact').eq('city', 'Bangor (Wales)').execute()
print(f"Listings for 'Bangor (Wales)': {res2.count}")
if res2.data:
    print("Sample 'Bangor (Wales)':", res2.data[0]['name'], res2.data[0]['trade'])

# Check 'Bangor (NI)' just in case
res3 = supabase.table('businesses').select('*', count='exact').eq('city', 'Bangor (NI)').execute()
print(f"Listings for 'Bangor (NI)': {res3.count}")

print("------------------------")
