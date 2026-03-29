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

# Look for businesses created in the last 2 hours
two_hours_ago = (datetime.now() - timedelta(hours=2)).isoformat()

print(f"--- Searching Project 1 for businesses created since {two_hours_ago} ---")

try:
    recent_url = f"{url}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&created_at=gte.{two_hours_ago}&order=created_at.desc"
    response = requests.get(recent_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        print(f"Businesses found: {len(data)}")
        if data:
            print(json.dumps(data, indent=2))
    else:
        print(f"Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
