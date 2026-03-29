import os
import requests
import json
from datetime import datetime, timedelta

# Project 1 (antqstr...)
url = "https://antqstrspkchkoylysqa.supabase.co"
# SERVICE ROLE KEY is needed for auth.admin
key = "sb_secret_cU09MJkRP69u1Nrb7C4gsw_h1vI_Y5_" 

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

one_day_ago = (datetime.now() - timedelta(days=1)).isoformat()

print("--- Checking Project 1 for New Users (Last 24h) ---")

try:
    # Supabase Auth Admin API
    auth_url = f"{url}/auth/v1/admin/users"
    response = requests.get(auth_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        users = data.get('users', [])
        print(f"Total Users: {len(users)}")
        
        recent_users = [u for u in users if u.get('created_at', '') >= one_day_ago]
        print(f"Users created in last 24h: {len(recent_users)}")
        if recent_users:
            for u in recent_users:
                print(f"  - {u.get('created_at')}: {u.get('email')} (ID: {u.get('id')})")
        else:
            # Show the last 5 users overall
            print("\nLast 5 users overall:")
            sorted_users = sorted(users, key=lambda x: x.get('created_at', ''), reverse=True)
            for u in sorted_users[:5]:
                 print(f"  - {u.get('created_at')}: {u.get('email')} (ID: {u.get('id')})")
    else:
        print(f"Auth Admin Error: {response.status_code} {response.text}")
except Exception as e:
    print(f"Auth Admin Request failed: {e}")
