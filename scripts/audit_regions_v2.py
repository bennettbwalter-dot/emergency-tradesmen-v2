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

print("Checking Country Codes...")

# Check distinct country codes? Not easy with simple REST.
# Just check GB vs US counts.

url_gb = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=count"
resp_gb = requests.get(url_gb, headers=headers)
gb_count = resp_gb.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"Listings with country_code='GB': {gb_count}")

url_us = f"{supabase_url}/rest/v1/businesses?country_code=eq.US&select=count"
resp_us = requests.get(url_us, headers=headers)
us_count = resp_us.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"Listings with country_code='US': {us_count}")

url_null = f"{supabase_url}/rest/v1/businesses?country_code=is.null&select=count"
resp_null = requests.get(url_null, headers=headers)
null_count = resp_null.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"Listings with country_code=NULL: {null_count}")
