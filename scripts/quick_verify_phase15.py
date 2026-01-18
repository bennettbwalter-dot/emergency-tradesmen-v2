
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

targets = [
    "Bradford", "Coventry", "Nottingham", "Leicester", "Plymouth", "Stoke-on-Trent",
    "St Albans", "Worthing", "Crawley", "Brighton", "Brighton & Hove", "Newcastle upon Tyne", 
    "Newcastle-upon-Tyne", "Hull", "Derby", "Swansea", "Wolverhampton", "Bangor (Wales)", "Bangor (NI)"
]

print("Verifying Phase 15 Remediation...")
for city in targets:
    try:
        res = supabase.table('businesses').select('*', count='exact').eq('city', city).execute()
        count = res.count
        print(f"  {city}: {count} listings")
    except Exception as e:
        print(f"  {city}: Error {e}")

print("Done.")
