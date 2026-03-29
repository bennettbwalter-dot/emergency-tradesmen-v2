import os
import requests
import json

# Project 2 (xwqvhym...)
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

print("--- Fetching a sample of businesses from Project 2 ---")

try:
    sample_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&limit=5"
    response = requests.get(sample_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Results: {len(data)}")
        for b in data:
            print(f"ID: {b['id']} | Name: '{b['name']}' | City: {b['city']} | Trade: {b['trade']}")
    else:
        print(f"Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
