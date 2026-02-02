
import os
from supabase import create_client, Client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.environ.get("\ufeffVITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Get Listings Count
    res = supabase.table("businesses").select("id", count="exact").eq("country_code", "US").execute()
    count = res.count
    print(f"Total US Listings in Supabase: {count}")
    
    # Get Reviews Count (for US businesses)
    # We query reviews and filter by businesses that have country_code=US
    # A bit slow if done via join, so we just get total reviews as a proxy or use a simple query
    res_rev = supabase.table("reviews").select("id", count="exact").execute()
    print(f"Total Reviews in Database: {res_rev.count}")
    
    # Get a sample of recent ones
    res2 = supabase.table("businesses").select("id, name, city, trade").eq("country_code", "US").order("created_at", desc=True).limit(5).execute()
    print("\nMost recent US additions:")
    for row in res2.data:
        # Check if this business has reviews
        rev_count = supabase.table("reviews").select("id", count="exact").eq("business_id", row['id']).execute().count
        print(f" - {row['name']} ({row['city']} - {row['trade']}) | Reviews: {rev_count}")

except Exception as e:
    print(f"Error querying: {e}")
