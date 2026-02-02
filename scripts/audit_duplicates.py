import os
import json
from supabase import create_client
from dotenv import load_dotenv
from collections import defaultdict

load_dotenv()

URL = os.getenv("VITE_SUPABASE_URL")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
sb = create_client(URL, KEY)

def audit():
    print("Scanning for US duplicates (Name + Phone + Trade)...")
    
    # Fetch all US businesses
    # Note: If there are too many, we might need to batch, but let's try 5000 first
    res = sb.table("businesses").select("id, name, phone, trade, city").eq("country_code", "US").limit(10000).execute()
    
    if not res.data:
        print("No US businesses found.")
        return

    businesses = res.data
    print(f"Total US businesses fetched: {len(businesses)}")

    # Map: (phone, trade) -> list of IDs
    duplicates = defaultdict(list)
    
    for b in businesses:
        if b['phone']:
            key = (b['phone'], b['trade'])
            duplicates[key].append(b)

    found_duplicates = {k: v for k, v in duplicates.items() if len(v) > 1}

    if not found_duplicates:
        print("✅ No duplicates found (Phone + Trade).")
    else:
        print(f"❌ Found {len(found_duplicates)} duplicate sets.")
        for (phone, trade), set_biz in found_duplicates.items():
            print(f"\nDuplicate Set for Phone: {phone}, Trade: {trade}")
            for b in set_biz:
                print(f"  - ID: {b['id']}, Name: {b['name']}, City: {b['city']}")

if __name__ == "__main__":
    audit()
