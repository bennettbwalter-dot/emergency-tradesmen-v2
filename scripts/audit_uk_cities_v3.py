
import os
from supabase import create_client, Client
from collections import Counter

# Manual .env parsing
env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                k, v = line.split('=', 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k == "VITE_SUPABASE_URL":
                    url = v
                elif k == "VITE_SUPABASE_ANON_KEY":
                    key = v
except Exception as e:
    print(f"Error reading .env: {e}")

if not url or not key:
    print(f"Error: Credentials missing. URL={url}, KEY={'Found' if key else 'Missing'}")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching all distinct cities from DB...")

all_rows = []
start = 0
limit = 1000

while True:
    try:
        response = supabase.table('businesses').select('city, country_code').range(start, start + limit - 1).execute()
        if not response.data:
            break
        all_rows.extend(response.data)
        start += limit
        print(f"Fetched {len(all_rows)} rows...")
        if len(response.data) < limit:
            break
    except Exception as e:
        print(f"Error fetching data: {e}")
        break

uk_cities = set()
uk_counts = Counter()

for b in all_rows:
    city = b.get('city', '').strip()
    country = b.get('country_code', '')
    
    if country in ['GB', 'UK']:
        if city:
            uk_cities.add(city)
            uk_counts[city] += 1

print(f"\nTotal Unique UK Cities in DB: {len(uk_cities)}")
print("\n--- Listing All DB UK Cities for Config Check ---")
for city in sorted(uk_cities):
    print(city)
