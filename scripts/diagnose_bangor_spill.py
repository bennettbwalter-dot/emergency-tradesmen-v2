
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

print("Searching for A&I Plumbing...")
res = sb.table('businesses').select('*').ilike('name', 'A&I Plumbing%').execute()

for item in res.data:
    print(f"ID: {item['id']}")
    print(f"Name: {item['name']}")
    print(f"City: {item['city']}")
    print(f"Address: {item.get('address')}")
    print(f"Phone: {item['phone']}")
    print("-" * 20)
    
print("Checking for other 'London' records in 'Bangor'...")
res_bangor = sb.table('businesses').select('*').ilike('city', '%Bangor%').execute()

suspicious = []
for item in res_bangor.data:
    name = str(item.get('name', '')).lower()
    addr = str(item.get('address', '')).lower()
    desc = str(item.get('description', '')).lower()
    
    if 'london' in name or 'london' in addr or 'london' in desc:
        suspicious.append(item)
    elif '020' in str(item.get('phone','')):
        suspicious.append(item)

print(f"Found {len(suspicious)} suspicious records in Bangor.")
for s in suspicious:
    print(f"  SUSPECT: {s['name']} (Phone: {s['phone']}) -> {s['city']}")
