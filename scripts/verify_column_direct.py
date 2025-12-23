import os
import requests
import json
from dotenv import load_dotenv

curr_dir = os.path.dirname(os.path.abspath(__file__))
prod_env_path = os.path.join(curr_dir, '..', '.env.production')
load_dotenv(prod_env_path)

p2_url = os.getenv("VITE_SUPABASE_URL")
p2_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"--- Direct Column Check against {p2_url} ---")

# Try to select one of the "missing" columns
url = f"{p2_url}/rest/v1/businesses?select=id,name,header_image_url&limit=1"
headers = {
    "apikey": p2_key,
    "Authorization": f"Bearer {p2_key}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("✅ SUCCESS: The column 'header_image_url' exists and is querying correctly!")
        print(response.json())
    else:
        print(f"❌ FAILED: API returned {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
