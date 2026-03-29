
import os
from supabase import create_client, Client
from collections import Counter

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('VITE_SUPABASE_URL='):
                    url = line.split('=')[1].strip()
                elif line.startswith('VITE_SUPABASE_ANON_KEY='):
                    key = line.split('=')[1].strip()
    except:
        pass

if not url or not key:
    print("Error: Could not find Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("Fetching all distinct cities from DB (Auditing UK coverage)...")

# We fetch all businesses and analyze the city distribution
# In a real scenario with 50k rows, we might paginate, but let's try a direct scan of relevant fields
response = supabase.table('businesses').select('city, country_code').execute()

uk_cities = set()
us_cities = set()
uk_counts = Counter()

for b in response.data:
    city = b.get('city', '').strip()
    country = b.get('country_code', '')
    
    # Heuristic: If country is GB or UK, it's UK.
    # If not specified, we might check against known lists, but let's stick to explicit first.
    if country in ['GB', 'UK']:
        uk_cities.add(city)
        uk_counts[city] += 1
    elif country == 'US':
        us_cities.add(city)

sorted_uk = sorted(uk_cities)
print(f"Total Unique UK Cities in DB: {len(sorted_uk)}")
print("Top 50 UK Cities by listing count:")
for city, count in uk_counts.most_common(50):
    print(f"{city}: {count}")

print("\n--- Listing All DB UK Cities for Config Check ---")
print(", ".join(sorted_uk))
