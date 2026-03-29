import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_ANON_KEY')

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def mark_verified():
    print("🚀 Starting batched verification update...")
    
    batch_size = 200
    total_updated = 0
    
    while True:
        # Fetch a batch of IDs that need verification
        fetch_url = f"{supabase_url}/rest/v1/businesses?verified=eq.false&select=id&limit={batch_size}"
        r = requests.get(fetch_url, headers=headers)
        
        if r.status_code != 200:
            print(f"❌ Error fetching batch: {r.status_code}")
            break
            
        batch = r.json()
        if not batch:
            print("✨ All listings verified!")
            break
            
        ids = [row['id'] for row in batch]
        ids_str = ",".join([f'"{id}"' for id in ids])
        
        # Update this specific batch
        update_url = f"{supabase_url}/rest/v1/businesses?id=in.({ids_str})"
        data = {"verified": True}
        
        res = requests.patch(update_url, headers=headers, data=json.dumps(data))
        
        if res.status_code in [200, 204]:
            total_updated += len(ids)
            print(f"✅ Updated batch of {len(ids)} (Total: {total_updated})")
        else:
            print(f"❌ Error updating batch: {res.status_code}")
            print(res.text)
            break

if __name__ == "__main__":
    mark_verified()
