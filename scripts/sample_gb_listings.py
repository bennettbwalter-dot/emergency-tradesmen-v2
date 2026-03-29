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

print("Sampling 5 GB Listings...")

url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&limit=5"
resp = requests.get(url, headers=headers)
data = resp.json()

for biz in data:
    print(f"\nID: {biz.get('id')}")
    print(f"Name: {biz.get('name')}")
    print(f"City: '{biz.get('city')}'")
    print(f"Trade: '{biz.get('trade')}'")
    print(f"Country Code: {biz.get('country_code')}")
