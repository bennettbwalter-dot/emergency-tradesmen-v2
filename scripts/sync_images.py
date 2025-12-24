import os
import requests
import json
from dotenv import load_dotenv

# Project 1 (antqstr... - Dev)
p1_url = "https://antqstrspkchkoylysqa.supabase.co"
p1_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFudHFzdHJzcGtjaGtveWx5c3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk0NDQsImV4cCI6MjA4MDk1NTQ0NH0._AYpRtOq9N6UOie0XJi6HoEdRTw9vDG9SCg1L1quzvw"

# Project 2 (xwqvhym... - Prod)
curr_dir = os.path.dirname(os.path.abspath(__file__))
prod_env_path = os.path.join(curr_dir, '..', '.env.production')
load_dotenv(prod_env_path)
p2_url = os.getenv("VITE_SUPABASE_URL")
p2_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

search_name = "nick nack plum"

print(f"--- Comparing '{search_name}' between projects ---")

try:
    # Fetch from P1
    h1 = {"apikey": p1_key, "Authorization": f"Bearer {p1_key}"}
    r1 = requests.get(f"{p1_url}/rest/v1/businesses?name=eq.{search_name}", headers=h1)
    
    # Fetch from P2
    h2 = {"apikey": p2_key, "Authorization": f"Bearer {p2_key}"}
    r2 = requests.get(f"{p2_url}/rest/v1/businesses?name=eq.{search_name}", headers=h2)
    
    if r1.status_code == 200 and r1.json():
        b1 = r1.json()[0]
        print("\nProject 1 (Source/Local) Data:")
        print(f"Logo: {b1.get('logo_url')}")
        print(f"Header: {b1.get('header_image_url')}")
        print(f"Vehicle: {b1.get('vehicle_image_url')}")
        
        if r2.status_code == 200 and r2.json():
            b2 = r2.json()[0]
            print("\nProject 2 (Target/Live) Data:")
            print(f"Logo: {b2.get('logo_url')}")
            print(f"Header: {b2.get('header_image_url')}")
            print(f"Vehicle: {b2.get('vehicle_image_url')}")
            
            # Check for differences
            fields_to_check = [
                'logo_url', 'header_image_url', 'vehicle_image_url', 
                'premium_description', 'tier', 'priority_score', 'last_available_ping',
                'photos'
            ]
            diff = {}
            for f in fields_to_check:
                if b1.get(f) != b2.get(f):
                    diff[f] = b1.get(f)
            
            if diff:
                print(f"\nDifferences found: {json.dumps(diff, indent=2)}")
                print("Updating Project 2...")
                
                upd_resp = requests.patch(
                    f"{p2_url}/rest/v1/businesses?id=eq.{b2['id']}",
                    headers={**h2, "Content-Type": "application/json", "Prefer": "return=minimal"},
                    data=json.dumps(diff)
                )
                
                if upd_resp.status_code in [200, 204]:
                    print("Successfully updated Project 2 with new images!")
                else:
                    print(f"Failed to update Project 2: {upd_resp.status_code} {upd_resp.text}")
            else:
                print("\nNo differences found in image fields.")
        else:
            print("Business not found on Project 2.")
    else:
        print("Business not found on Project 1.")

except Exception as e:
    print(f"Error: {e}")
