import os
import requests
import json

# Project 2 (xwqvhym...) - The one live site uses
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
# Anon Key from .env.production
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json",
    "Prefer": "count=exact"
}

print("--- Checking Project 2 (PROD) with Anon Key ---")

# 1. Total Count
try:
    count_url = f"{url}/rest/v1/businesses?select=id"
    response = requests.get(count_url, headers=headers)
    if response.status_code == 200:
        count = response.headers.get('Content-Range', '').split('/')[-1]
        print(f"Total Businesses: {count}")
    else:
        print(f"Count Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Count Request failed: {e}")

# 2. Try to list columns
try:
    resp = requests.get(f"{url}/rest/v1/businesses?select=*&limit=1", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        if data:
            print("Columns in 'businesses' table:")
            print(", ".join(data[0].keys()))
        else:
            print("Table is empty (0 rows successfully returned).")
    else:
        print(f"Select Error: {resp.status_code} {resp.text}")
except Exception as e:
    print(f"Select Request failed: {e}")
