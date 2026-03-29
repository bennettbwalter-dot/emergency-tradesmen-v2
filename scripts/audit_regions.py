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

print("Checking UK Data Integrity...")

# 1. Count Total
url = f"{supabase_url}/rest/v1/businesses?select=count"
resp = requests.get(url, headers=headers)
total = resp.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"Total Businesses in DB: {total}")

# 2. Count likely UK (e.g. phone starts with 07, 02, 01 or currency is GBP or country is UK)
# Note: 'country' column might not exist or be consistent.
# Let's check a sample to see structure.

url_sample = f"{supabase_url}/rest/v1/businesses?limit=1"
sample = requests.get(url_sample, headers={'apikey': supabase_key}).json()
if sample:
    print(f"\nSample Keys: {list(sample[0].keys())}")
    if 'country' in sample[0]:
        print(f"Sample Country: {sample[0]['country']}")
    if 'currency' in sample[0]:
         print(f"Sample Currency: {sample[0]['currency']}")

# Try filtering by currency = GBP vs USD
url_uk = f"{supabase_url}/rest/v1/businesses?currency=eq.GBP&select=count"
resp_uk = requests.get(url_uk, headers=headers)
uk_count = resp_uk.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"\nlistings with currency=GBP: {uk_count}")

url_us = f"{supabase_url}/rest/v1/businesses?currency=eq.USD&select=count"
resp_us = requests.get(url_us, headers=headers)
us_count = resp_us.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"listings with currency=USD: {us_count}")

# Try filtering by phone prefix (generic check)
url_uk_phone = f"{supabase_url}/rest/v1/businesses?phone=ilike.07*&select=count"
resp_uk_ph = requests.get(url_uk_phone, headers=headers)
uk_ph_count = resp_uk_ph.headers.get('content-range', '0-0/0').split('/')[-1]
print(f"listings with phone starting '07...' (approx UK mobile): {uk_ph_count}")
