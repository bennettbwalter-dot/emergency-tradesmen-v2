
import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Load env
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
if not SUPABASE_URL:
     SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL") # Handle BOM

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"Error: Missing credentials. URL found? {bool(SUPABASE_URL)} KEY found? {bool(SUPABASE_KEY)}")
    # Try hardcoded partial debug if needed, but this matched fill_usa_gaps.py
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def check_activity():
    print("🔍 Auditing Database Activity (Last 24 Hours)...")
    
    # Calculate timestamp for 24h ago
    # Note: Supabase/Postgres uses ISO format. We can just checking recent IDs or use raw count if possible, 
    # but querying by times might be safer.
    # Actually, simpler: verify if ANY 'GB' rows have high IDs or recent timestamps.
    
    # Check UK (GB) additions
    try:
        # standard ISO format for filter might be tricky with python lib without exact match, 
        # but let's try grabbing the most recent GB listing.
        res_uk = supabase.table("businesses").select("created_at, name, city").eq("country_code", "GB").order("created_at", desc=True).limit(1).execute()
        
        if res_uk.data:
            latest_uk = res_uk.data[0]
            print(f"\n🇬🇧 LATEST UK LISTING FOUND:")
            print(f"   Name: {latest_uk['name']}")
            print(f"   Created: {latest_uk['created_at']}")
        else:
            print("\n🇬🇧 NO UK LISTINGS FOUND AT ALL.")
            
        # Check US additions (recent 5)
        res_us = supabase.table("businesses").select("created_at, name, city").eq("country_code", "US").order("created_at", desc=True).limit(5).execute()
        
        print(f"\n🇺🇸 LATEST 5 US LISTINGS:")
        for row in res_us.data:
             print(f"   [{row['created_at']}] {row['name']} ({row['city']})")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_activity()
