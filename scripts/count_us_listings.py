import os
import requests
import json
import re

# Read .env to get Supabase URL and Anon Key
env_path = '.env'
supabase_url = None
supabase_key = None

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        env_content = f.read()
        url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)
        if url_match: supabase_url = url_match.group(1).strip()
        if key_match: supabase_key = key_match.group(1).strip()

if not supabase_url or not supabase_key:
    print("Env missing")
    exit(1)

supabase_url = supabase_url.strip('"').strip("'")
supabase_key = supabase_key.strip('"').strip("'")

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Count US business listings (country_code = 'US')
count_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.US&select=id"
headers["Prefer"] = "count=exact"

try:
    response = requests.get(count_url, headers=headers)
    if response.status_code in [200, 206]:
        count_range = response.headers.get("Content-Range", "0-0/0")
        count = count_range.split("/")[-1]
        print(f"Total US Listings: {count}")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Failed: {e}")
