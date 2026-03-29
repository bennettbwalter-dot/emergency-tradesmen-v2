import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
}

def sample_unverified():
    # 1. Check MKUK Electrical Ltd specifically
    mkuk_url = f"{supabase_url}/rest/v1/businesses?name=eq.MKUK%20Electrical%20Ltd&select=name,city,address,phone,trade,country_code"
    r = requests.get(mkuk_url, headers=headers)
    print("--- MKUK Electrical Ltd Info ---")
    print(json.dumps(r.json(), indent=2))
    
    # 2. Sample US Unverified
    us_unverified_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.US&verified=eq.false&limit=5&select=name,city,address,phone,trade"
    r = requests.get(us_unverified_url, headers=headers)
    print("\n--- US Unverified Samples ---")
    print(json.dumps(r.json(), indent=2))
    
    # 3. Sample UK Unverified (excluding MKUK if found)
    uk_unverified_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&verified=eq.false&limit=5&select=name,city,address,phone,trade"
    r = requests.get(uk_unverified_url, headers=headers)
    print("\n--- UK Unverified Samples ---")
    print(json.dumps(r.json(), indent=2))

if __name__ == "__main__":
    sample_unverified()
