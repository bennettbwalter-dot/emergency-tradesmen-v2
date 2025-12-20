import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars
env_path = os.path.join(os.getcwd(), '.env')
load_dotenv(env_path)

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(url, key)

def check_premium_businesses():
    print("--- Fetching Premium Businesses ---")
    # Fetch businesses where is_premium is true or tier is paid
    res = supabase.table("businesses").select("*").or_("is_premium.eq.true,tier.eq.paid").order("created_at", desc=True).limit(5).execute()
    
    if not res.data:
        print("No premium businesses found.")
        return

    for biz in res.data:
        print(f"ID: {biz.get('id')}")
        print(f"Name: {biz.get('name')}")
        print(f"Is Premium: {biz.get('is_premium')}")
        print(f"Tier: {biz.get('tier')}")
        print(f"Logo URL: {biz.get('logo_url')}")
        print(f"Priority Score: {biz.get('priority_score')}")
        print(f"Photos: {biz.get('photos')}")
        print("-" * 30)

if __name__ == "__main__":
    check_premium_businesses()
