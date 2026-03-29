import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env vars
env_path = os.path.join(os.getcwd(), '..', '.env') # Path adjustment
load_dotenv(env_path)

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("Missing Supabase credentials in .env")
    exit(1)

supabase: Client = create_client(url, key)

def dump_businesses():
    print("--- Dumping All Businesses ---")
    res = supabase.table("businesses").select("id, name, is_premium, tier, logo_url, created_at").order("created_at", desc=True).execute()
    
    if not res.data:
        print("No businesses found.")
        return

    for biz in res.data:
        print(f"ID: {biz.get('id')}")
        print(f"Name: {biz.get('name')}")
        print(f"Is Premium: {biz.get('is_premium')}")
        print(f"Tier: {biz.get('tier')}")
        print(f"Logo: {biz.get('logo_url')}")
        print(f"Created At: {biz.get('created_at')}")
        print("-" * 30)

if __name__ == "__main__":
    dump_businesses()
