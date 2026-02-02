import os
import requests
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
        # Try both ANON and SERVICE keys if available, checking ANON first as usual 
        # but we know from inspection that anon key might be powerful or regular.
        # Let's simple check for ANON.
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

# Try to call 'reload_schema' RPC
# This is a common utility function. If it doesn't exist, we get 404.
print("Attempting to call rpc/reload_schema...")
url = f"{supabase_url}/rest/v1/rpc/reload_schema"

resp = requests.post(url, headers=headers, json={})

if resp.status_code == 200 or resp.status_code == 204:
    print("SUCCESS: Schema reload triggered!")
    print(resp.text)
else:
    print(f"FAILURE: API returned {resp.status_code}")
    print(resp.text)
    # If 404, the function doesn't exist.
