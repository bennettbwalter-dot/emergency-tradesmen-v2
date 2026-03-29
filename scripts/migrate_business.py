import os
import requests
import json

p1 = {
    "name": "Project 1 (antqstr...)",
    "url": "https://antqstrspkchkoylysqa.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"
}

p2 = {
    "name": "Project 2 (xwqvhym...)",
    "url": "https://xwqvhymkwuasotsgmarn.supabase.co",
    "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"
}

search_name = "nick nack plum"

print(f"--- Migrating '{search_name}' ---")

try:
    # 1. Fetch from P1
    headers1 = {"apikey": p1['key'], "Authorization": f"Bearer {p1['key']}"}
    resp1 = requests.get(f"{p1['url']}/rest/v1/businesses?name=eq.{search_name}", headers=headers1)
    
    if resp1.status_code == 200 and resp1.json():
        biz = resp1.json()[0]
        print(f"Found on P1: {biz['id']}")
        
        # 2. Clean up for insert into P2
        # Remove fields that might not exist in P2 schema or should be fresh
        # But for now let's just insert what we can
        
        # P2 has issues with tier/priority_score columns sometimes being missing from cache
        # I'll only include columns I know exist
        known_columns = [
            'id', 'name', 'slug', 'trade', 'city', 'address', 'phone', 'email', 'website',
            'hours', 'is_open_24_hours', 'rating', 'review_count', 'featured_review',
            'verified', 'is_premium', 'logo_url', 'premium_description', 
            'services_offered', 'coverage_areas', 'whatsapp_number'
        ]
        
        payload = {k: v for k, v in biz.items() if k in known_columns}
        
        # Force these for visibility
        payload['verified'] = True
        payload['is_premium'] = True
        
        # 3. Insert into P2
        headers2 = {
            "apikey": p2['key'], 
            "Authorization": f"Bearer {p2['key']}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }
        
        # Check if ID exists in P1 but not P2? P2 used the sync script UUIDs.
        # This biz has id "dev-test-1766203466707", which is a string.
        # Project 2 might expect UUID for 'id'? 
        # Actually, Supabase IDs are usually UUID. Let's check P2 schema for 'id' type.
        
        resp2 = requests.post(f"{p2['url']}/rest/v1/businesses", headers=headers2, data=json.dumps(payload))
        
        if resp2.status_code in [200, 201]:
            print(f"Successfully migrated to P2!")
        else:
            print(f"Failed to migrate: {resp2.status_code} {resp2.text}")
            
            if "invalid input syntax for type uuid" in resp2.text:
                print("ID must be UUID. Generating a UUID for P2...")
                import uuid
                payload['id'] = str(uuid.uuid4())
                resp3 = requests.post(f"{p2['url']}/rest/v1/businesses", headers=headers2, data=json.dumps(payload))
                if resp3.status_code in [200, 201]:
                    print(f"Successfully migrated with new UUID: {payload['id']}")
                else:
                    print(f"Failed again: {resp3.status_code} {resp3.text}")
    else:
        print("Could not find business on P1.")

except Exception as e:
    print(f"Error: {e}")
