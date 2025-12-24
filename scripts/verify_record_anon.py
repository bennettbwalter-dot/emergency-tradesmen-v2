import os
import requests
import json
from dotenv import load_dotenv

curr_dir = os.path.dirname(os.path.abspath(__file__))
prod_env_path = os.path.join(curr_dir, '..', '.env.production')
load_dotenv(prod_env_path)

p2_url = os.getenv("VITE_SUPABASE_URL")
p2_anon_key = os.getenv("VITE_SUPABASE_ANON_KEY")

target_id = "a898986b-7556-47f0-a66f-f5fbabd26491"

print(f"--- Checking Business {target_id} with ANON KEY ---")

url = f"{p2_url}/rest/v1/businesses?id=eq.{target_id}&select=id,name,header_image_url,vehicle_image_url"
headers = {
    "apikey": p2_anon_key,
    "Authorization": f"Bearer {p2_anon_key}",
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data:
            print("✅ Record Found (Anon):")
            print(json.dumps(data[0], indent=2))
        else:
            print("❌ Record NOT found.")
    else:
        print(f"❌ API Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error: {e}")
