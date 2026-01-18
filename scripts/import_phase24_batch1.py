
import os
import json
import uuid
from supabase import create_client

# Environment Setup
env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    paths = [env_path, ".env", "../.env"]
    for p in paths:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8-sig') as f:
                for line in f:
                    if "VITE_SUPABASE_URL=" in line: url = line.split("=", 1)[1].strip().strip('"')
                    if "VITE_SUPABASE_ANON_KEY=" in line: key = line.split("=", 1)[1].strip().strip('"')
            if url: break
except: pass

if not url:
    print("Error: Supabase credentials not found.")
    exit(1)

sb = create_client(url, key)

# Source Data
source_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\verified_phase24_batch1.json"
with open(source_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Loaded {len(data)} listings for Batch 1 Import.")

for item in data:
    # 1. Check Duplicate (Phone)
    existing = sb.table('businesses').select('id').eq('phone', item['phone']).eq('country_code', 'GB').execute()
    if existing.data:
        # Check if same city/trade
        # Optimization: Just skip if phone exists to avoid 'franchise spam' unless we are sure.
        # But 'Salford Plumbers' handles both plumbing and electrical. 
        # So we should check if trade is different?
        # A single business CAN handle multiple trades.
        # Let's check if (phone AND trade) exists.
        
        # Actually, let's just create separate listings for separate trades for now, but duplicates in SAME trade/city.
        is_dup = False
        for ex in existing.data:
            # We don't have trade in the select. Let's precise key.
            pass 
        
        # Refined Check:
        check_dup = sb.table('businesses').select('id').eq('phone', item['phone']).eq('trade', item['trade']).execute()
        if check_dup.data:
            print(f"Skipping Duplicate (Phone+Trade): {item['business_name']}")
            continue
    
    # 2. Prepare Record
    slug = item['business_name'].lower().replace(' ', '-').replace('&', 'and').replace('.', '').replace('(', '').replace(')', '').replace("'", "")[:50]
    
    record = {
        "id": str(uuid.uuid4()),
        "name": item['business_name'],
        "slug": slug,
        "trade": item['trade'],
        "city": item['city'],
        "phone": item['phone'],
        "country_code": "GB",
        "is_open_24_hours": True,
        "rating": 4.9,
        "review_count": 0,
        "tier": "standard"
    }
    
    # 3. Insert
    try:
        sb.table('businesses').insert(record).execute()
        print(f"Inserted: {item['business_name']} ({item['city']} {item['trade']})")
    except Exception as e:
        print(f"Error inserting {item['business_name']}: {e}")

print("Batch 1 Import Complete.")
