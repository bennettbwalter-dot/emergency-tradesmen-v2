"""
Deep gap audit: for every city in cityPostcodes.ts, check each of the 11 trades.
Reports total gaps (city+trade combos with zero listings) and the worst offenders.
"""
import requests
import re

env_content = open('.env.uk.local').read()
url = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content).group(1)
key = re.search(r'SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s]+)', env_content).group(1)
read_headers = {'apikey': key, 'Authorization': f'Bearer {key}'}

TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown", "hvac"
]

# Load cities from file
cities_in_file = []
with open('src/lib/cityPostcodes.ts', encoding='utf-8') as f:
    for line in f:
        m = re.search(r'"([^"]+)":\s*"[^"]+"', line)
        if m:
            cities_in_file.append(m.group(1))

print(f'Target cities: {len(cities_in_file)} | Target trades: {len(TRADES)}')
print(f'Total required combos: {len(cities_in_file) * len(TRADES)}')
print('Scanning... (this may take a few minutes)')

gaps = []  # list of (city, trade) tuples
city_gap_counts = {}

for i, city in enumerate(cities_in_file):
    city_gaps = 0
    for trade in TRADES:
        r = requests.get(
            f'{url}/rest/v1/businesses',
            params={'city': f'eq.{city}', 'trade': f'eq.{trade}', 'country_code': 'eq.GB', 'select': 'id', 'limit': '1'},
            headers=read_headers
        )
        if r.status_code == 200 and len(r.json()) == 0:
            gaps.append((city, trade))
            city_gaps += 1
    city_gap_counts[city] = city_gaps
    if (i + 1) % 50 == 0:
        print(f'  Scanned {i+1}/{len(cities_in_file)} cities... {len(gaps)} gaps found so far')

print(f'\n=== RESULTS ===')
print(f'Total gaps (city+trade combos missing): {len(gaps)}')
print(f'Out of {len(cities_in_file) * len(TRADES)} required combos')
pct = ((len(cities_in_file) * len(TRADES) - len(gaps)) / (len(cities_in_file) * len(TRADES))) * 100
print(f'Coverage: {pct:.1f}%')

# Cities with ALL 11 trades missing
full_zero = [c for c, cnt in city_gap_counts.items() if cnt == 11]
print(f'\nCities with ALL trades missing ({len(full_zero)}):')
for c in full_zero[:30]:
    print(f'  - {c}')

# Cities with partial gaps (1-10 missing)
partial = [(c, cnt) for c, cnt in city_gap_counts.items() if 0 < cnt < 11]
partial.sort(key=lambda x: -x[1])
print(f'\nCities with partial gaps - worst 20:')
for c, cnt in partial[:20]:
    print(f'  - {c}: {cnt} trades missing')
