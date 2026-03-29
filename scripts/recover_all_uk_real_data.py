
import os
import json
import re
import uuid
from supabase import create_client, Client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            clean_line = line.strip()
            if clean_line.startswith("VITE_SUPABASE_URL="):
                url = clean_line.split('=', 1)[1].strip()
            elif clean_line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = clean_line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

SCRIPTS_DIR = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts"
    
# UK Phone Regex: loosely match +44, 07xxx, 01xxx, 02xxx
# US Phone Regex: +1, (xxx), xxx-xxx
UK_PHONE_PATTERN = re.compile(r'^(?:\+44|0044|0)[12378]\d+')

def is_uk_phone(phone_str):
    if not phone_str: return False
    clean = re.sub(r'[^0-9+]', '', phone_str)
    if clean.startswith('+44'): return True
    if clean.startswith('07'): return True # Mobile
    if clean.startswith('01'): return True # Landline
    if clean.startswith('02'): return True # London/Major
    if clean.startswith('08'): return True # Toll
    if clean.startswith('03'): return True # Non-geo
    return False

# Load existing to avoid dupes (optimization)
print("Fetching existing UK phones map...")
existing_phones = set()
try:
    # Fetch just enough to build a bloom filter or set
    # Actually for 15k, we strictly want to avoid dupes.
    # We can fetch all GB rows phones.
    res = supabase.table('businesses').select('phone').eq('country_code', 'GB').execute()
    for r in res.data:
        if r.get('phone'):
            existing_phones.add(r['phone'])
            # Also clean version
            existing_phones.add(re.sub(r'[^0-9+]', '', r['phone']))
except Exception as e:
    print(f"Warning fetching existing phones: {e}")

print(f"Loaded {len(existing_phones)} existing UK phones.")

# Scan
print("Scanning for *_real.json files...")
files = [f for f in os.listdir(SCRIPTS_DIR) if f.endswith('_real.json')]
print(f"Found {len(files)} candidate files.")

uk_files_found = 0
total_listings_found = 0
listings_to_insert = []

# Trade mapping from filename
# e.g. london_plumber_real.json -> plumber
# e.g. aberdeen_waterrestoration_real.json -> water-restoration
def infer_trade(filename):
    lower = filename.lower()
    if 'plumber' in lower: return 'plumber'
    if 'electrician' in lower: return 'electrician'
    if 'locksmith' in lower: return 'locksmith'
    if 'hvac' in lower: return 'hvac'
    if 'roofer' in lower: return 'roofer'
    if 'builder' in lower: return 'builder'
    if 'glazier' in lower: return 'glazier'
    if 'glass' in lower: return 'glazier'
    if 'drain' in lower: return 'drain-specialist'
    if 'gas' in lower: return 'gas-engineer'
    if 'water' in lower: return 'water-restoration'
    if 'breakdown' in lower: return 'breakdown'
    if 'tow' in lower: return 'breakdown'
    return 'other'

for fname in files:
    fpath = os.path.join(SCRIPTS_DIR, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list): continue
        if not data: continue
        
        # Check first item for UK indicators
        first = data[0]
        phone = first.get('phone', '')
        
        if is_uk_phone(phone):
            uk_files_found += 1
            city = filename_city = fname.split('_')[0].title() 
            # infer trade
            trade = infer_trade(fname)
            
            for item in data:
                p = item.get('phone', '')
                clean_p = re.sub(r'[^0-9+]', '', p)
                
                if not p: continue
                if clean_p in existing_phones: continue
                
                # Check duplication within batch
                # (Simple set check here if needed, but 'existing_phones' handles global)
                
                # Prepare payload
                name = item.get('name')
                if not name: continue
                
                # Slug gen
                slug_base = f"{name} {city}".lower()
                slug = re.sub(r'[^a-z0-9]', '-', slug_base) + f"-{str(uuid.uuid4())[:5]}"
                
                listings_to_insert.append({
                    "id": str(uuid.uuid4()),
                    "name": name,
                    "trade": trade,
                    "city": city, # We might want to map this to canonical if possible, or just use file implication
                    "slug": slug,
                    "phone": p,
                    "country_code": "GB",
                    "verified": True,
                    "tier": "basic",
                    "created_at": "2024-01-01T00:00:00Z" # Backdate slightly or current
                })
                existing_phones.add(clean_p) # Prevent dupes within this run
                
    except Exception as e:
        # print(f"Error reading {fname}: {e}")
        pass

print(f"Identified {uk_files_found} UK-specific files.")
print(f"Found {len(listings_to_insert)} NEW unique UK listings to insert.")

# Batch Insert
BATCH_SIZE = 100
if listings_to_insert:
    print("Starting insertion...")
    for i in range(0, len(listings_to_insert), BATCH_SIZE):
        batch = listings_to_insert[i:i+BATCH_SIZE]
        try:
            supabase.table('businesses').insert(batch).execute()
            print(f"  Inserted batch {i}-{i+len(batch)}")
        except Exception as e:
            print(f"  Error batch {i}: {e}")

print("Done.")
