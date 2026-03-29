import os
import requests
import json
import re

# Read .env to get Supabase URL and Anon Key
env_path = os.path.join('..', '.env')
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
    exit(1)

supabase_url = supabase_url.strip('"').strip("'")
supabase_key = supabase_key.strip('"').strip("'")

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Fetch all owned businesses
owned_url = f"{supabase_url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,owner_user_id&owner_user_id=not.is.null"

try:
    response = requests.get(owned_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"All Owned Businesses ({len(data)}):")
        print(json.dumps(data, indent=2))
    else:
        print(f"Error querying Supabase: {response.status_code}")
except Exception as e:
    print(f"Request failed: {e}")
