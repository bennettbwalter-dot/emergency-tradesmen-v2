import os
import requests
import json
import re

# --- Supabase Setup ---
env_path = '.env'
if not os.path.exists(env_path):
    env_path = os.path.join('..', '.env')
supabase_url = None
supabase_key = None

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        env_content = f.read()
        url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)
        if url_match: supabase_url = url_match.group(1).strip().strip("'").strip('"')
        if key_match: supabase_key = key_match.group(1).strip().strip("'").strip('"')

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "count=exact"
}

print("Checking Trade Name Case Sensitivity for GB Listings...")

# Fetch 100 GB listings and list their trade names
url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=trade&limit=100"
resp = requests.get(url, headers=headers)
data = resp.json()

if not data:
    print("No GB listings found to sample.")
else:
    trades = [d.get('trade') for d in data]
    unique_trades = set(trades)
    print(f"Unique Trades found in sample: {unique_trades}")

# Check generic 'plumber' count (case sensitive)
url_lower = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&trade=eq.plumber&select=count"
count_lower = requests.get(url_lower, headers=headers).headers.get('content-range', '0-0/0').split('/')[-1]

url_cap = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&trade=eq.Plumber&select=count"
count_cap = requests.get(url_cap, headers=headers).headers.get('content-range', '0-0/0').split('/')[-1]

print(f"\nExact match 'plumber': {count_lower}")
print(f"Exact match 'Plumber': {count_cap}")
