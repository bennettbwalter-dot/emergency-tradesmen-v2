import json
import os
import requests
import re
import time

# --- Supabase Setup ---
env_path = '.env'
if not os.path.exists(env_path):
    env_path = os.path.join('..', '.env')
supabase_url = None
supabase_key = None

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        env_content = f.read()
        url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)
        if url_match: supabase_url = url_match.group(1).strip().strip("'").strip('"')
        if key_match: supabase_key = key_match.group(1).strip().strip("'").strip('"')

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

BACKUP_FILE = 'scraped_data_backup.jsonl'

def sync_data():
    if not os.path.exists(BACKUP_FILE):
        print(f"No backup file found at {BACKUP_FILE}")
        return

    print("Reading backup file and syncing to Supabase...")
    
    success_count = 0
    fail_count = 0
    
    with open(BACKUP_FILE, 'r') as f:
        lines = f.readlines()
        
    print(f"Found {len(lines)} records to sync.")

    for line in lines:
        try:
            record = json.loads(line)
            biz_id = record.get('id')
            updates = record.get('updates')
            
            if not biz_id or not updates:
                continue

            # Skip empty updates if we want to be faster, but maybe we want to mark them as checked?
            # actually updates usually contains social_links: {} if empty, which is valid to save to avoid re-scraping
            
            url = f"{supabase_url}/rest/v1/businesses?id=eq.{biz_id}"
            resp = requests.patch(url, headers=headers, json=updates)
            
            if resp.status_code in [200, 204]:
                print(f"[{success_count+fail_count+1}/{len(lines)}] Success: {biz_id}")
                success_count += 1
            else:
                print(f"[{success_count+fail_count+1}/{len(lines)}] Failed: {biz_id} - {resp.status_code} - {resp.text}")
                fail_count += 1
                
        except json.JSONDecodeError:
            print("Skipping invalid JSON line")
        except Exception as e:
            print(f"Error syncing record: {e}")
            fail_count += 1
            
    print(f"\nSync Complete.")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    sync_data()
