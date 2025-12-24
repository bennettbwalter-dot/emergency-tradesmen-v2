import os
import requests
import json
from dotenv import load_dotenv

# Project 1 (antqstr... - Dev)
p1_url = "https://antqstrspkchkoylysqa.supabase.co"
p1_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"

search_name = "nick nack plum"

print(f"--- Checking 'photos' and 'business_photos' for '{search_name}' in Project 1 ---")

try:
    # 1. Fetch from businesses table
    h1 = {"apikey": p1_key, "Authorization": f"Bearer {p1_key}"}
    r1 = requests.get(f"{p1_url}/rest/v1/businesses?name=eq.{search_name}", headers=h1)
    
    if r1.status_code == 200 and r1.json():
        biz = r1.json()[0]
        biz_id = biz['id']
        print(f"Business ID: {biz_id}")
        
        # Check 'photos' column  
        if 'photos' in biz:
            print(f"Column 'photos': {json.dumps(biz['photos'], indent=2)}")
        else:
            print("Column 'photos' NOT found in response (might be null or not selected explicitly if select=*)")

        # 2. Check business_photos table
        r_photos = requests.get(f"{p1_url}/rest/v1/business_photos?business_id=eq.{biz_id}", headers=h1)
        if r_photos.status_code == 200:
             print(f"Table 'business_photos': {json.dumps(r_photos.json(), indent=2)}")
        else:
             print(f"Table 'business_photos' check failed: {r_photos.status_code}")

    else:
        print("Business not found on Project 1.")

except Exception as e:
    print(f"Error: {e}")
