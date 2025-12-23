import os
import requests
import json
from datetime import datetime, timedelta

# Project 1 (antqstr...)
url = "https://antqstrspkchkoylysqa.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

seven_days_ago = (datetime.now() - timedelta(days=7)).isoformat()

print("--- Checking Project 1 for Premium and Recent Businesses ---")

# 1. Premium Businesses
try:
    premium_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&is_premium=eq.true"
    response = requests.get(premium_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Premium Businesses Total: {len(data)}")
        if data:
            print("Latest 5 Premium:")
            sorted_premium = sorted(data, key=lambda x: x.get('created_at', ''), reverse=True)
            print(json.dumps(sorted_premium[:5], indent=2))
    else:
        print(f"Premium Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Premium Request failed: {e}")

# 2. Businesses created in last 7 days
try:
    recent_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&created_at=gte.{seven_days_ago}&order=created_at.desc"
    response = requests.get(recent_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"\nBusinesses created in last 7 days: {len(data)}")
        if data:
            for b in data:
                print(f"  - {b.get('created_at')}: {b.get('name')} (Premium: {b.get('is_premium')}, Verified: {b.get('verified')}, City: {b.get('city')})")
    else:
        print(f"Recent Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Recent Request failed: {e}")
