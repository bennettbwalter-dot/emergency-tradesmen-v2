import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("YELP_API_KEY")

def test_yelp():
    url = "https://api.yelp.com/v3/businesses/search"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    params = {
        "term": "plumber",
        "location": "Dallas, TX",
        "limit": 5
    }
    
    print(f"Testing Yelp API search...")
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        print(f"Status Code: {resp.status_code}")
        if resp.status_code == 200:
            count = len(resp.json().get("businesses", []))
            print(f"Success! Found {count} businesses.")
            # Print rate limit headers
            print(f"Rate Limit Remaining: {resp.headers.get('x-ratelimit-remaining')}")
        else:
            print(f"Error: {resp.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_yelp()
