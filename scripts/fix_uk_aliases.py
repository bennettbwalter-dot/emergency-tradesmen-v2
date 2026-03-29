
import os
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

alias_map = [
    ("Newcastle upon Tyne", "Newcastle-upon-Tyne"),
    ("Newcastle-upon-Tyne", "Newcastle upon Tyne"),
    ("Brighton", "Brighton & Hove"),
    ("Stoke", "Stoke-on-Trent"),
]

print("Starting Aliases Synchronization (Retry with UUID)...")

valid_fields = [
    'name', 'trade', 'city', 'country_code', 'phone', 'rating', 
    'isOpen24Hours', 'verified', 'slug', 'email', 'website', 
    'review_count', 'latitude', 'longitude', 'zip'
]

for source, target in alias_map:
    print(f"\nProcessing: '{source}' -> '{target}'")
    
    res_source = supabase.table('businesses').select('*').eq('city', source).execute()
    source_listings = res_source.data
    
    if not source_listings:
        print(f"  No listings found for source '{source}'. Skipping.")
        continue
        
    print(f"  Found {len(source_listings)} listings in '{source}'. Syncing...")

    added = 0
    errors = 0
    skipped = 0
    
    for b in source_listings:
        # Check existence
        existing = supabase.table('businesses').select('*')\
            .eq('city', target)\
            .eq('phone', b['phone'])\
            .execute()
            
        if existing.data:
            skipped += 1
            continue
            
        # Construct payload manually to avoid ID issues
        payload = {}
        for k in valid_fields:
            if k in b:
                payload[k] = b[k]
        
        # Override city
        payload['city'] = target
        
        # New Slug
        if 'slug' in payload and payload['slug']:
            payload['slug'] = f"{payload['slug']}-{target.replace(' ', '-').lower()}"
            
        # FORCE UUID
        payload['id'] = str(uuid.uuid4())
        
        try:
            supabase.table('businesses').insert(payload).execute()
            print(f"    + Synced: {payload['name']}")
            added += 1
        except Exception as e:
            print(f"    ! Error: {e}")
            errors += 1
            
    print(f"  Result: {added} added, {skipped} skipped, {errors} errors.")

print("\nDone.")
