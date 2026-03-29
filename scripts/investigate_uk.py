import os
import requests
import json
import re
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
}

def investigate_uk():
    # Get unverified UK samples
    unverified_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&verified=eq.false&limit=5&select=name,city,created_at,verified,website,rating"
    r = requests.get(unverified_url, headers=headers)
    print("--- Unverified UK Samples ---")
    print(json.dumps(r.json(), indent=2))
    
    # Get verified UK samples
    verified_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&verified=eq.true&limit=5&select=name,city,created_at,verified,website,rating"
    r = requests.get(verified_url, headers=headers)
    print("\n--- Verified UK Samples ---")
    print(json.dumps(r.json(), indent=2))
    
    # Check creation distribution for UK
    dist_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=created_at"
    # Just get a few to see the date range/format
    r = requests.get(dist_url + "&limit=10", headers=headers)
    print("\n--- UK Created At Samples ---")
    for row in r.json():
        print(row.get('created_at'))

if __name__ == "__main__":
    investigate_uk()
