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
    print("Error: Supabase credentials not found in ..\\.env")
    exit(1)

# Ensure URL is clean
supabase_url = supabase_url.strip('"').strip("'")
supabase_key = supabase_key.strip('"').strip("'")

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json"
}

# Search for London Plumbers
# We check 'trade' (lowercase) and 'city' (case sensitive as per fetchBusinesses eq('city', city))
search_url = f"{supabase_url}/rest/v1/businesses?trade=eq.plumber&select=id,name,city,trade,verified,is_premium,tier,selected_locations"

try:
    response = requests.get(search_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Found {len(data)} plumbers in the database:")
        print(json.dumps(data, indent=2))
        
        # Also check for ALL London businesses to see if trade might be different
        london_url = f"{supabase_url}/rest/v1/businesses?city=eq.London&select=id,name,city,trade,verified"
        london_response = requests.get(london_url, headers=headers)
        if london_response.status_code == 200:
            london_data = london_response.json()
            print(f"\nAll London businesses ({len(london_data)}):")
            print(json.dumps(london_data, indent=2))
    else:
        print(f"Error querying Supabase: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Request failed: {e}")
