import os
import requests
import re
import time

# --- Supabase Setup ---
# Check current directory first, then parent
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
    "Content-Type": "application/json"
}

# Try to select the new column
print("Checking schema cache...")
url = f"{supabase_url}/rest/v1/businesses?select=social_links&limit=1"

resp = requests.get(url, headers=headers)

if resp.status_code == 200:
    print("SUCCESS: 'social_links' column is visible to the API.")
else:
    print(f"FAILURE: API returned {resp.status_code}")
    print(resp.text)
