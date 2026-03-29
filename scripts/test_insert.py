import os
import uuid
import re
from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env')

url = os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
sb = create_client(url, key)

biz = {
    "name": "Test Entry " + str(uuid.uuid4())[:4],
    "phone": "9999999999",
    "website": "http://example.com"
}
trade = "plumber"
city = "TestCity"

slug = f"{re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')}-{str(uuid.uuid4())[:8]}"
data = {
    "id": str(uuid.uuid4()), 
    "name": biz['name'], 
    "slug": slug,
    "trade": trade, 
    "city": city, 
    "country_code": "US",
    "phone": biz['phone'], 
    "address": "123 Test St",
    "verified": True, 
    "tier": "standard", 
    "created_at": datetime.now().isoformat(),
    "website": biz.get('website'),
    "social_links": {} # This is the suspected problem column
}

print(f"Attempting insert with social_links...")
try:
    res = sb.table("businesses").insert(data).execute()
    print("Insert SUCCESS")
except Exception as e:
    print(f"Insert FAILED: {e}")

print(f"\nAttempting insert WITHOUT social_links...")
data.pop("social_links")
data["id"] = str(uuid.uuid4())
data["slug"] = data["slug"] + "-no-social"
try:
    res = sb.table("businesses").insert(data).execute()
    print("Insert WITHOUT social_links SUCCESS")
except Exception as e:
    print(f"Insert WITHOUT social_links FAILED: {e}")
