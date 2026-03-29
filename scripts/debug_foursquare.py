import os
import requests
from dotenv import load_dotenv

def test_keys():
    load_dotenv()
    # Find all keys in env that might be Foursquare
    env_keys = {k: v for k, v in os.environ.items() if "FOURSQUARE" in k}
    
    print(f"--- Foursquare Diagnosis ---")
    print(f"Found {len(env_keys)} keys in environment.")
    
    url = "https://api.foursquare.com/v3/places/search?near=Dallas,TX&limit=1"
    
    for name, key in env_keys.items():
        if not key:
            print(f"[{name}] is empty. Skipping.")
            continue
            
        print(f"\nTesting {name}: {key[:10]}...")
        headers = {"Authorization": key, "Accept": "application/json"}
        
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            print(f"  Status: {resp.status_code}")
            if resp.status_code == 200:
                print(f"  ✅ SUCCESS! v3 key is working.")
            elif resp.status_code == 401:
                print(f"  ❌ ERROR 401: Unauthorized. The key is in v3 format but Foursquare says it is invalid/inactive.")
            elif resp.status_code == 410:
                print(f"  ❌ ERROR 410: Gone/Deprecated. This key is for the OLD Foursquare v2 API and cannot be used with v3.")
            else:
                print(f"  ❌ ERROR {resp.status_code}: {resp.text[:100]}")
        except Exception as e:
            print(f"  ⚠️ Request Error: {e}")

if __name__ == "__main__":
    test_keys()
