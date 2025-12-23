import os
import requests
import json
import re
from datetime import datetime, timedelta

# Project configs
projects = [
    {
        "name": "Project 1 (antqstr...)",
        "url": "https://antqstrspkchkoylysqa.supabase.co",
        "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"
    },
    {
        "name": "Project 2 (xwqvhym...)",
        "url": "https://xwqvhymkwuasotsgmarn.supabase.co",
        "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"
    }
]

one_day_ago = (datetime.now() - timedelta(days=1)).isoformat()

for p in projects:
    print(f"\n--- Checking {p['name']} ---")
    headers = {
        "apikey": p['key'],
        "Authorization": f"Bearer {p['key']}",
        "Content-Type": "application/json",
        "Prefer": "count=exact"
    }

    # 1. Total Count
    try:
        count_url = f"{p['url']}/rest/v1/businesses?select=id"
        response = requests.get(count_url, headers=headers)
        if response.status_code == 200:
            count = response.headers.get('Content-Range', '').split('/')[-1]
            print(f"Total Businesses: {count}")
        else:
            print(f"Count Error: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Count Request failed: {e}")

    # 2. Recent Businesses (Last 24h)
    try:
        recent_url = f"{p['url']}/rest/v1/businesses?select=id,name,city,trade,verified,is_premium,created_at&created_at=gte.{one_day_ago}&order=created_at.desc"
        response = requests.get(recent_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"Businesses created in last 24h: {len(data)}")
            if data:
                print(json.dumps(data, indent=2))
        elif response.status_code == 400 and "column businesses.tier" in response.text:
            # Retry without tier if needed (already excluded from select but maybe some index/RLS issue? Unlikely)
            pass
        else:
             print(f"Recent Error: {response.status_code} {response.text}")
    except Exception as e:
        print(f"Recent Request failed: {e}")

    # 3. Last 5 businesses overall (to see what is actually in there)
    try:
        all_recent_url = f"{p['url']}/rest/v1/businesses?select=id,name,created_at&order=created_at.desc&limit=5"
        response = requests.get(all_recent_url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"Last 5 recorded businesses:")
            for b in data:
                print(f"  - {b.get('created_at')}: {b.get('name')} ({b.get('id')})")
    except Exception as e:
        print(f"All Recent Request failed: {e}")
