
import os
import json
import re
from dotenv import load_dotenv
from supabase import create_client, Client

# --- Configuration ---
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.environ.get("\ufeffVITE_SUPABASE_URL")
if not SUPABASE_URL:
    SUPABASE_URL = "https://xwqvhymkwuasotsgmarn.supabase.co"

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"❌ Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def analyze_location_match(city, address):
    """
    Returns a score of how well the city matches the address.
    Higher is better.
    """
    if not address or not city:
        return 0
    
    city_norm = city.lower().strip()
    address_norm = address.lower()
    
    # Exact match in string
    if city_norm in address_norm:
        return 2
    
    # Partial match logic could go here, but keep simple for now
    return 1 if address_norm else 0

def main():
    print("🚀 STARTING UK DUPLICATE REMOVAL")
    
    # 1. Load Duplicates from Report
    report_path = "uk_duplicate_report.json"
    if not os.path.exists(report_path):
        print("❌ Report file not found.")
        return

    with open(report_path, "r") as f:
        data = json.load(f)
        
    duplicates = data.get("duplicates", [])
    print(f"Loaded {len(duplicates)} duplicate groups.")
    
    removed_count = 0
    kept_count = 0
    skipped_count = 0
    
    # 2. Process Groups
    for dup in duplicates:
        occurrences = dup['occurrences']
        if len(occurrences) <= 1:
            continue
            
        print(f"\nProcessing group: {dup['name_normalized']} ({dup['phone_normalized']})")
        
        # Enriched occurrences with scores
        scored_candidates = []
        for occ in occurrences:
            # We need to fetch the full address if it wasn't in the summarized occurrences 
            # (Wait, the report generation script didn't save address in occurrences list in audit_uk_duplicates.py? 
            # I must check. Actually, looking at audit_uk_duplicates.py, I did NOT save address in occurrences list.
            # I only saved id, city, trade, name, phone.
            # I need to fetch the full record to do the address check.
            pass

        # Since we don't have addresses in the report, valid approach:
        # 1. Collect all IDs in this group.
        # 2. Fetch full details (including address) for these IDs from Supabase.
        # 3. Apply logic.
        
        occ_ids = [occ['id'] for occ in occurrences]
        
        try:
            res = supabase.table("businesses").select("*").in_("id", occ_ids).execute()
            rows = res.data
        except Exception as e:
            print(f"   ⚠️ Error fetching details: {e}")
            skipped_count += 1
            continue
            
        if not rows:
            print("   ⚠️ No rows found in DB (already deleted?)")
            continue

        # Score them
        # Criteria:
        # 1. Website present (+1)
        # 2. Address contains City (+2)
        # 3. Tie-breaker: Created At (Keep older? Or newer? Prompt says 'Keep the listing in the correct city')
        
        scored = []
        for row in rows:
            score = 0
            if row.get('website'):
                score += 1
            
            loc_score = analyze_location_match(row.get('city'), row.get('address'))
            score += loc_score * 2
            
            scored.append((score, row))
            
        # Sort desc by score
        scored.sort(key=lambda x: x[0], reverse=True)
        
        winner = scored[0][1]
        losers = [s[1] for s in scored[1:]]
        
        print(f"   🏆 Keeping: {winner['city']} | {winner['address']} (Score: {scored[0][0]})")
        
        # Delete Losers
        loser_ids = [l['id'] for l in losers]
        if loser_ids:
            try:
                # Batch delete
                supabase.table("businesses").delete().in_("id", loser_ids).execute()
                print(f"   🗑️ Removed {len(loser_ids)} duplicates: {', '.join([l['city'] for l in losers])}")
                removed_count += len(loser_ids)
                kept_count += 1
            except Exception as e:
                print(f"   ❌ Delete failed: {e}")
        else:
            print("   ⚠️ No duplicates to delete (logic error?)")

    print("\nREMOVAL SUMMARY")
    print("--------------------------------------------------")
    print(f"Duplicate Groups Processed: {len(duplicates)}")
    print(f"Listings Removed:           {removed_count}")
    print(f"Listings Preserved:         {kept_count}")
    print(f"Groups Skipped (Error):     {skipped_count}")
    print("--------------------------------------------------")

if __name__ == "__main__":
    main()
