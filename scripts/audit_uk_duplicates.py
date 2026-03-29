
import os
import json
import re
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Configuration ---
# improved .env loading
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"Loaded .env from: {env_path}")
else:
    load_dotenv() # Fallback to default
    print("Loaded .env from default location")

# Handle potential BOM in .env key or fallback
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
if not SUPABASE_URL:
    # Try with BOM if python-dotenv didn't strip it but loaded it as a key
    SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL")

if not SUPABASE_URL:
    print("⚠️  Using hardcoded fallback for Supabase URL")
    SUPABASE_URL = "https://xwqvhymkwuasotsgmarn.supabase.co"

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"❌ Missing Supabase credentials. URL: {bool(SUPABASE_URL)}, KEY: {bool(SUPABASE_KEY)}")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def normalize_phone(phone):
    """Normalize phone number for comparison (remove spaces, +44, etc.)"""
    if not phone:
        return ""
    # Remove all non-digit characters
    p = re.sub(r'\D', '', phone)
    # Normalize 44 to 0
    if p.startswith('44'):
        p = '0' + p[2:]
    return p

def normalize_name(name):
    """Normalize business name (lowercase, remove excess spaces)"""
    if not name:
        return ""
    return re.sub(r'\s+', ' ', name.lower().strip())

def main():
    print("🚀 STARTING UK DUPLICATE LISTING AUDIT")
    print("   Goal: Identify listing duplicates (Same Name + Same Phone).")
    print("   Scope: UK Only.")
    
    # 1. Fetch All UK Data
    print("\nFetching UK businesses from Supabase...", end="", flush=True)
    all_rows = []
    
    # Simple pagination loop
    offset = 0
    batch_size = 1000
    while True:
        try:
            res = supabase.table("businesses").select("id, city, trade, name, phone").eq("country_code", "GB").range(offset, offset + batch_size - 1).execute()
            rows = res.data
            if not rows:
                break
            all_rows.extend(rows)
            offset += batch_size
            print(".", end="", flush=True)
        except Exception as e:
            print(f"\n❌ Error fetching data: {e}")
            break
        
    print(f"\nTotal UK Businesses Scanned: {len(all_rows)}")
    
    # 2. Analyze for Duplicates
    print("\nAnalyzing for duplicates...")
    
    # Dictionary to map (norm_name, norm_phone) -> list of occurrences
    # occurrences = [ {id, city, trade, original_name, original_phone} ]
    grouped = {}
    
    for row in all_rows:
        n_name = normalize_name(row.get('name'))
        n_phone = normalize_phone(row.get('phone'))
        
        # Skip incomplete records if strict (but prompt implies if any field missing skip, 
        # but here we are auditing existing info. If phone is missing, can't dup check strictly on phone)
        # We will key by name+phone. If phone is empty, key is name only? 
        # The prompt says: "A duplicate means: Same business name and Same phone number"
        # So both must be present to be considered this specific type of duplicate.
        
        if not n_name or not n_phone:
            continue
            
        key = (n_name, n_phone)
        
        if key not in grouped:
            grouped[key] = []
            
        grouped[key].append({
            "id": row.get('id'),
            "city": row.get('city'),
            "trade": row.get('trade'),
            "name": row.get('name'),
            "phone": row.get('phone')
        })
        
    # Filter for duplicates (count > 1)
    duplicates = []
    duplicate_count = 0
    
    for key, occurrences in grouped.items():
        if len(occurrences) > 1:
            duplicate_count += 1
            duplicates.append({
                "name_normalized": key[0],
                "phone_normalized": key[1],
                "count": len(occurrences),
                "occurrences": occurrences
            })
            
    # 3. Report Output
    duplicates.sort(key=lambda x: x['count'], reverse=True)
    
    print("\nAUDIT SUMMARY")
    print("--------------------------------------------------")
    print(f"Total UK Listings Scanned: {len(all_rows)}")
    print(f"Duplicate Groups Found:    {duplicate_count}")
    print("--------------------------------------------------")

    report_data = {
        "summary": {
            "total_scanned": len(all_rows),
            "duplicate_groups": duplicate_count,
            "total_duplicate_entries": sum(d['count'] for d in duplicates)
        },
        "duplicates": duplicates
    }
    
    with open("uk_duplicate_report.json", "w") as f:
        json.dump(report_data, f, indent=2)
        
    print(f"\nFull report saved to: uk_duplicate_report.json")
    
    # 4. Preview
    if duplicates:
        print("\nDUPLICATE PREVIEW (Top 10):")
        for dup in duplicates[:10]:
            print(f"   - {dup['occurrences'][0]['name']} ({dup['occurrences'][0]['phone']})")
            print(f"     Appears {dup['count']} times:")
            for occ in dup['occurrences']:
                print(f"       -> {occ['city']} / {occ['trade']}")
            print("")
    else:
        print("\n✅ No duplicates found based on Name + Phone criteria.")

if __name__ == "__main__":
    main()
