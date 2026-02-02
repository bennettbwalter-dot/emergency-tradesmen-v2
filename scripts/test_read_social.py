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

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

print("Attempting to SELECT social_links column from businesses...")
url = f"{supabase_url}/rest/v1/businesses?select=id,name,social_links&limit=1"

resp = requests.get(url, headers=headers)

if resp.status_code == 200:
    print("SUCCESS: Read social_links column.")
    print(json.dumps(resp.json(), indent=2))
else:
    print(f"FAILURE: {resp.status_code}")
    print(resp.text)
