
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

print("--- Purging US Data from Bangor (NI) ---")
# Identify suspect listings in "Bangor" (implied NI)
# Roto-Rooter is definitely US.
suspicious_names = ["Roto-Rooter", "Nichols Plumbing", "Jackson Plumbing", "Integrity Electric", "Starr Electrical"] # Common US names

# Delete by city='Bangor' AND matching name pattern OR country_code='US' (if set mistakenly)
res = supabase.table('businesses').select('*').eq('city', 'Bangor').execute()
for b in res.data:
    should_delete = False
    if "Roto-Rooter" in b['name']: should_delete = True
    if "Integrity Electric" in b['name']: should_delete = True
    if "Starr Electrical" in b['name']: should_delete = True
    if b.get('country_code') == 'US': should_delete = True
    
    if should_delete:
        print(f"Deleting US-suspect listing: {b['name']} ({b['city']})")
        supabase.table('businesses').delete().eq('id', b['id']).execute()

print("Done.")
