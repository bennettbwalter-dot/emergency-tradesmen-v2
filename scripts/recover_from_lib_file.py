
import os
import re
import json
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

supabase: Client = create_client(url, key)

LIB_FILE = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts\businesses_lib.txt"
UK_CITY_FILE = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts"

# Load UK Cities
print("Loading UK Cities...")
with open(UK_CITY_FILE, 'r', encoding='utf-8') as f:
    content = f.read()
    matches = re.findall(r'^\s*"([^"]+)":\s*"', content, re.MULTILINE)
    uk_cities = set([c.lower() for c in matches])

print(f"Loaded {len(uk_cities)} UK cities.")

# UK Phone Check
def is_uk_phone(phone_str):
    if not phone_str: return False
    clean = re.sub(r'[^0-9+]', '', phone_str)
    if clean.startswith('+44'): return True
    if clean.startswith('07'): return True 
    if clean.startswith('01'): return True 
    if clean.startswith('02'): return True 
    if clean.startswith('08'): return True 
    if clean.startswith('03'): return True 
    return False

# Existing Phones (Optimization)
print("Fetching existing DB phones...")
existing_phones = set()
res = supabase.table('businesses').select('phone').eq('country_code', 'GB').execute()
for r in res.data:
    if r.get('phone'):
        existing_phones.add(re.sub(r'[^0-9+]', '', r['phone']))

# Parse Lib File
print("Parsing businesses_lib.txt...")
with open(LIB_FILE, 'r', encoding='utf-8') as f:
    lib_content = f.read()

# Regex to find object blocks. This is tricky for nested structures.
# We'll use a simpler heuristic: match `id: "...",` blocks and extract fields nearby.
# Or better, identifying keys `london: {` implies city.
# But keys might be quoted or not.
# `london: {` 
# `    breakdown: [`
# `        {`
# `            id:`

# Alternative: Find all `{ ... }` blocks containing 'id:' and 'phone:'
# Then parse them.

# Let's simple regex for properties since formatting is consistent
#     id: "london-breakdown-1",
#     name: "Mobile Mechanic London",
#     ...
#     phone: "+44 7415 037941",
#     ...
#     city: "London" (if present, often it's not and implied by parent object?)
# In the snippet, 'address' was 'London', 'city' field was NOT present in the object, 
# relying on the parent key `london:`.

# Complex strategy:
# 1. Split by `[city]: {` keys if possible.
# 2. Or just regex iterate all objects and infer city from `address` or `id`.
# ID often contains city `london-breakdown-1`.

objects = []
# Match pattern: { ... id: "...", ... }
# We'll regex iter over `{.*?}` with DOTALL, but that matches too much or too little using non-greedy.
# Better: Iterate lines. State machine.

listings = []
current_city_context = None
current_trade_context = None
current_obj = {}
in_object = False

lines = lib_content.splitlines()

# Regex for city key: `    london: {`
city_key_re = re.compile(r'^\s*([a-zA-Z0-9_-]+):\s*\{')
# Regex for trade key: `        breakdown: [`
trade_key_re = re.compile(r'^\s*([a-zA-Z0-9_-]+):\s*\[')

for line in lines:
    clean = line.strip()
    
    # Check context
    m_city = city_key_re.match(line)
    if m_city:
        key = m_city.group(1)
        if key in ['london', 'luton'] or key in uk_cities or key.lower() in uk_cities: # heuristics
            current_city_context = key
            # print(f"Context City: {key}")
        continue

    m_trade = trade_key_re.match(line)
    if m_trade:
        current_trade_context = m_trade.group(1)
        continue

    # Object start
    if clean == '{':
        in_object = True
        current_obj = {}
        continue
        
    # Object end
    if clean == '},' or clean == '}':
        if in_object and 'id' in current_obj:
            # Finalize object
            if current_city_context: current_obj['city_context'] = current_city_context
            if current_trade_context: current_obj['trade_context'] = current_trade_context
            listings.append(current_obj)
        in_object = False
        continue
        
    if in_object:
        # Extract fields
        # id: "..."
        # name: "..."
        # phone: "..."
        parts = clean.split(':', 1)
        if len(parts) == 2:
            k = parts[0].strip()
            v = parts[1].strip().strip(',').strip('"').strip("'")
            if k in ['id', 'name', 'phone', 'address', 'website', 'email']:
                current_obj[k] = v

print(f"Parsed {len(listings)} raw objects.")

# Filter and Insert
to_insert = []
for obj in listings:
    phone = obj.get('phone', '')
    name = obj.get('name', '')
    
    if not phone or not name: continue
    
    clean_p = re.sub(r'[^0-9+]', '', phone)
    
    # Must be UK
    if not is_uk_phone(phone): continue
    
    # Must not verify exist
    if clean_p in existing_phones: continue
    
    # Infer City
    city = obj.get('city_context', 'Unknown')
    # If city context is vague, look at 'address' or 'id'
    if city == 'Unknown':
        # id: "london-breakdown-1"
        parts = obj.get('id', '').split('-')
        if len(parts) > 0 and parts[0] in uk_cities:
            city = parts[0]
            
    # Normalize city title case
    city = city.title()
    
    # Infer Trade
    trade = obj.get('trade_context', 'other')
    # Map valid trades only?
    # standardizing
    if trade == 'plumbing': trade = 'plumber'
    
    slug_base = f"{name} {city}".lower()
    slug = re.sub(r'[^a-z0-9]', '-', slug_base) + f"-{str(uuid.uuid4())[:5]}"

    to_insert.append({
        "id": str(uuid.uuid4()),
        "name": name,
        "trade": trade,
        "city": city,
        "slug": slug,
        "phone": phone,
        "country_code": "GB",
        "verified": True,
        "tier": "basic",
        "created_at": "2024-01-01T00:00:00Z"
    })
    existing_phones.add(clean_p) # duplicate protection

print(f"Found {len(to_insert)} NEW UK listings from library.")

# Insert
BATCH_SIZE = 100
if to_insert:
    print("Inserting...")
    for i in range(0, len(to_insert), BATCH_SIZE):
        batch = to_insert[i:i+BATCH_SIZE]
        try:
            supabase.table('businesses').insert(batch).execute()
            print(f"  Inserted batch {i}-{i+len(batch)}")
        except Exception as e:
            print(f"  Error batch {i}: {e}")
            
print("Done.")
