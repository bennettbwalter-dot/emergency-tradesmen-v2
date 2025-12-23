import os
import requests
import json

# Correcting the Service Role Key for P2 based on file inspection
key2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5MDM0MywiZXhwIjoyMDgxNTY2MzQzfQ.ZJQXY5OzkfO4Ey2G5enTdPHx_shgDMGAUaTJAHKDKuus"

p1 = {
    "name": "Project 1 (antqstr...)",
    "url": "https://antqstrspkchkoylysqa.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"
}

p2 = {
    "name": "Project 2 (xwqvhym...)",
    "url": "https://xwqvhymkwuasotsgmarn.supabase.co",
    "key": key2
}

search_name = "nick nack plum"

print(f"--- Migrating '{search_name}' with Service Role Key ---")

try:
    # 1. Fetch from P1
    headers1 = {"apikey": p1['key'], "Authorization": f"Bearer {p1['key']}"}
    resp1 = requests.get(f"{p1['url']}/rest/v1/businesses?name=eq.{search_name}", headers=headers1)
    
    if resp1.status_code == 200 and resp1.json():
        biz = resp1.json()[0]
        print(f"Found on P1: {biz['id']}")
        
        # 2. Map columns
        known_columns = [
            'name', 'slug', 'trade', 'city', 'address', 'phone', 'email', 'website',
            'hours', 'is_open_24_hours', 'rating', 'review_count', 'featured_review',
            'verified', 'is_premium', 'logo_url', 'premium_description', 
            'services_offered', 'coverage_areas', 'whatsapp_number'
        ]
        
        payload = {k: v for k, v in biz.items() if k in known_columns}
        payload['verified'] = True
        payload['is_premium'] = True
        
        # Generate a UUID for Project 2 to avoid collisions or type errors
        import uuid
        payload['id'] = str(uuid.uuid4())
        
        # 3. Post to P2
        headers2 = {
            "apikey": p2['key'], 
            "Authorization": f"Bearer {p2['key']}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        
        resp2 = requests.post(f"{p2['url']}/rest/v1/businesses", headers=headers2, data=json.dumps(payload))
        
        if resp2.status_code in [200, 201, 204]:
            print(f"Successfully migrated to P2 with ID: {payload['id']}")
        else:
            print(f"Failed to migrate: {resp2.status_code} {resp2.text}")
    else:
        print("Could not find business on P1.")

except Exception as e:
    print(f"Error: {e}")
