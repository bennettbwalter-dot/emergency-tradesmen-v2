import os
import re
import requests

# Supabase Setup
env_path = '.env.uk.local'
if not os.path.exists(env_path):
    env_path = '.env'

supabase_url = None
supabase_key = None

with open(env_path, 'r') as f:
    env_content = f.read()
    url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
    key_match = re.search(r'SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s]+)', env_content)
    if not key_match:
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)

    if url_match: supabase_url = url_match.group(1).strip().strip("'").strip('"')
    if key_match: supabase_key = key_match.group(1).strip().strip("'").strip('"')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# 1. Get Cities
cities = []
try:
    with open('src/lib/cityPostcodes.ts', 'r') as f:
        for line in f:
            match = re.search(r'"([^"]+)":\s*"[^"]+"', line)
            if match:
                cities.append(match.group(1))
except Exception as e:
    print(f"Error reading cities: {e}")

# 2. Get Trades
trades = [
    "plumber", "electrician", "locksmith", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown", "hvac"
]

total_permutations = len(cities) * len(trades)

# 3. Query Database for coverage
limit = 1000
offset = 0
covered_permutations = set()
total_businesses = 0
added_today = 0 # Approximated by source='ddgs' if we tracked it, but we'll just check coverage

print("Fetching data from Supabase...")
while True:
    url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=id,city,trade&order=id&limit={limit}&offset={offset}"
    resp = requests.get(url, headers=headers)
    if resp.status_code != 200:
        print(f"Error: {resp.text}")
        break
    data = resp.json()
    if not data:
        break
    
    total_businesses += len(data)
    for row in data:
        covered_permutations.add(f"{row['city']}-{row['trade']}")
        if row['id'].startswith('ddgs-'):
            added_today += 1

    offset += limit

total_covered = len(covered_permutations)
gaps_remaining = total_permutations - total_covered

print(f"Total UK Districts: {len(cities)}")
print(f"Target Trades: {len(trades)}")
print(f"Total Required Pages: {total_permutations}")
print(f"Total Verified UK Businesses: {total_businesses}")
print(f"Unique Covered Pages: {total_covered}")
print(f"Added by DDGS: {added_today}")
print(f"Gaps Remaining: {gaps_remaining}")
print(f"Progress: {round((total_covered / total_permutations) * 100, 2) if total_permutations > 0 else 0}%")
