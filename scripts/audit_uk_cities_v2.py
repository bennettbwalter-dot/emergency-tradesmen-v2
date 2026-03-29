
import os
from supabase import create_client, Client
from collections import Counter
from dotenv import load_dotenv

# Force load .env
load_dotenv(r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env")

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print(f"Error: Credentials still missing. URL={url}, KEY={'Found' if key else 'Missing'}")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching all distinct cities from DB...")

# Use pagination to ensure we get everything if > 1000
all_rows = []
start = 0
limit = 1000

while True:
    response = supabase.table('businesses').select('city, country_code').range(start, start + limit - 1).execute()
    if not response.data:
        break
    all_rows.extend(response.data)
    start += limit
    print(f"Fetched {len(all_rows)} rows...")

uk_cities = set()
uk_counts = Counter()

for b in all_rows:
    city = b.get('city', '').strip()
    country = b.get('country_code', '')
    
    # Strict UK Check
    if country in ['GB', 'UK']:
        if city:
            uk_cities.add(city)
            uk_counts[city] += 1

print(f"\nTotal Unique UK Cities in DB: {len(uk_cities)}")
print("\n--- Listing All DB UK Cities for Config Check ---")
for city in sorted(uk_cities):
    print(city)
