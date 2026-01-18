
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

cities = [
    # Phase 3
    "Dover", "Folkestone", "Great Yarmouth", "King's Lynn", "Corby",
    # Phase 4
    "Redcar", "Tynemouth", "Washington",
    # Phase 5
    "Dumfries", "Falkirk", "Llandudno", "Rhyl", "Newry", "Londonderry"
]

print("--- Final UK Data Audit ---")
print(f"{'City':<20} | {'Count':<5}")
print("-" * 30)

total_count = 0
for city in cities:
    res = supabase.table('businesses').select('*', count='exact').eq('city', city).execute()
    count = res.count
    total_count += count
    print(f"{city:<20} | {count:<5}")

print("-" * 30)
print(f"Total New Listings: {total_count}")
print("---------------------------")
