import os
import requests
import json

# Project 1 (antqstr...)
url = "https://antqstrspkchkoylysqa.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

# Query PostgREST for table info (or just try a tiny select and look at the keys if we can't get metadata)
try:
    # Try to get one result to see the columns
    resp = requests.get(f"{url}/rest/v1/businesses?select=*&limit=1", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        if data:
            print("Columns in 'businesses' table:")
            print(", ".join(data[0].keys()))
        else:
            print("Table is empty, cannot determine columns via select *.")
    else:
        print(f"Error: {resp.status_code} {resp.text}")
except Exception as e:
    print(f"Request failed: {e}")
