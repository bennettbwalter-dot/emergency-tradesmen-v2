import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def get_stats():
    res = supabase.from_("businesses").select("*", count="exact").eq("country_code", "US").execute()
    total_us = res.count
    
    print(f"TOTAL_US_LISTINGS={total_us}")
    
    # Get breakdown by trade
    trades = [
        "plumber", "electrician", "locksmith", "gas-engineer", 
        "drain-specialist", "glazier", "roofer", "breakdown", 
        "builder", "water-restoration", "hvac"
    ]
    
    print("\nTRADE_BREAKDOWN:")
    for trade in trades:
        count = supabase.from_("businesses").select("*", count="exact").eq("country_code", "US").eq("trade", trade).execute().count
        print(f"  - {trade}: {count}")

if __name__ == "__main__":
    get_stats()
