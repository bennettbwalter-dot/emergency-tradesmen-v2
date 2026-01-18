
import os
import re
from supabase import create_client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    # Try multiple paths
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

print("Fetching orphans...")
res = sb.table('businesses').select('*').neq('country_code', 'GB').neq('country_code', 'US').execute()
orphans = res.data
# Also fetch nulls if neq skips them?
# neq might skip nulls.
# Let's try select where is null
res_null = sb.table('businesses').select('*').is_('country_code', 'null').execute()
orphans.extend(res_null.data)

print(f"Found {len(orphans)} orphans.")

uk_fix = 0
us_fix = 0
del_fix = 0

for item in orphans:
    phone = item.get('phone', '')
    addr = str(item.get('address', '')).lower() 
    city = str(item.get('city', '')).lower()
    
    clean_p = re.sub(r'[^0-9+]', '', str(phone))
    
    is_uk = False
    is_us = False
    
    if clean_p.startswith('+44') or clean_p.startswith('07') or clean_p.startswith('01') or clean_p.startswith('02'):
        is_uk = True
    elif clean_p.startswith('+1') or len(clean_p) == 10:
        is_us = True
        
    if 'uk' in addr or 'london' in addr or 'uk' in city: is_uk = True
    if 'usa' in addr or 'ny' in addr or 'tx' in addr or 'usa' in city: is_us = True
    
    # Heuristic for default if phone ambiguous but city implies
    if not is_uk and not is_us and 'manchester' in city: is_uk = True # unless Manchester NH? usually Context implies UK if not explicit
    
    if is_uk:
        sb.table('businesses').update({'country_code': 'GB'}).eq('id', item['id']).execute()
        uk_fix += 1
    elif is_us:
        sb.table('businesses').update({'country_code': 'US'}).eq('id', item['id']).execute()
        us_fix += 1
    else:
        # Delete invalid data
        sb.table('businesses').delete().eq('id', item['id']).execute()
        del_fix += 1

print(f"Fixed: UK={uk_fix}, US={us_fix}, Deleted={del_fix}")
