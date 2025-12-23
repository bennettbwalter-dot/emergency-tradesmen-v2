import os
import requests
import json
from datetime import datetime, timedelta

# Project 2 (xwqvhym...) - The one live site uses
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
# Anon Key from .env.production
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# Look for businesses created in the last hour
half_hour_ago = (datetime.now() - timedelta(minutes=60)).isoformat()

print(f"--- Searching for businesses created since {half_hour_ago} ---")

try:
    recent_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&created_at=gte.{half_hour_ago}&order=created_at.desc"
    response = requests.get(recent_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Businesses found: {len(data)}")
        if data:
            print(json.dumps(data, indent=2))
        else:
            # Fallback: Just show the 5 absolute most recent
            print("\nNo businesses in the last hour. Showing 5 most recent overall:")
            all_recent_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&order=created_at.desc&limit=5"
            resp2 = requests.get(all_recent_url, headers=headers)
            print(json.dumps(resp2.json(), indent=2))
    else:
        print(f"Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
