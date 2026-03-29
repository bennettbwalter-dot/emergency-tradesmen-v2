
import os
import re
from supabase import create_client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    paths = [
        r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env",
        ".env",
        "../.env"
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8-sig') as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("VITE_SUPABASE_URL="):
                        url = line.split('=', 1)[1].strip().strip('"').strip("'")
                    elif line.startswith("VITE_SUPABASE_ANON_KEY="):
                        key = line.split('=', 1)[1].strip().strip('"').strip("'")
            if url and key: break
except Exception as e:
    print(f"Error loading env: {e}")

if not url or not key:
    print("Error: Could not load Supabase credentials.")
    exit(1)

sb = create_client(url, key)

print("Checking Bangor Listings for 'London' in description...")
res = sb.table('businesses').select('*').eq('city', 'Bangor (Wales)').ilike('description', '%London%').execute()

contaminated = res.data
print(f"Found {len(contaminated)} contaminated records.")

for item in contaminated:
    old_desc = item.get('description', '')
    new_desc = re.sub(r'London', 'Bangor', old_desc, flags=re.IGNORECASE)
    # Also fix "M25" or other Londonisms if present? Just London for now.
    
    # Update
    sb.table('businesses').update({'description': new_desc}).eq('id', item['id']).execute()
    print(f"Fixed: {item['name']}")
    print(f"  Old: {old_desc}")
    print(f"  New: {new_desc}")

print("Done.")
