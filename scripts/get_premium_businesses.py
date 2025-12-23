import os
import requests
import json
import re

# Force .env for dev project
env_path = os.path.join('..', '.env')
if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        env_content = f.read()
        url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)
        if url_match: supabase_url = url_match.group(1).strip()
        if key_match: supabase_key = key_match.group(1).strip()
        print(f"Using credentials from {env_path}")

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found in ..\\.env")
    exit(1)

supabase_url = supabase_url.strip('"').strip("'")
supabase_key = supabase_key.strip('"').strip("'")

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Fetch 10 most recent businesses with minimal columns
minimal_url = f"{supabase_url}/rest/v1/businesses?select=id,name,created_at&order=created_at.desc&limit=10"

try:
    response = requests.get(minimal_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Recent Businesses ({len(data)} found):")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error querying Supabase: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
