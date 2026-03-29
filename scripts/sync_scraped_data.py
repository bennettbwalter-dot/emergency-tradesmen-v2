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

import sys

def sync_data(backup_file):
    if not os.path.exists(backup_file):
        print(f"No backup file found at {backup_file}")
        return

    print(f"Reading backup file {backup_file} and syncing to Supabase...")
    
    success_count = 0
    fail_count = 0
    
    with open(backup_file, 'r') as f:
        lines = f.readlines()
        
    print(f"Found {len(lines)} records to sync.")

    for line in lines:
        try:
            record = json.loads(line)
            biz_id = record.get('id') or record.get('supabase_id') # Handle both formats
            updates = record.get('updates') or {
                'facebook': record.get('socials', {}).get('facebook'),
                'instagram': record.get('socials', {}).get('instagram'),
                'linkedin': record.get('socials', {}).get('linkedin')
            }
            
            if not biz_id or not any(updates.values()):
                continue

            url = f"{supabase_url}/rest/v1/businesses?id=eq.{biz_id}"
            resp = requests.patch(url, headers=headers, json=updates)
            
            if resp.status_code in [200, 204]:
                # print(f"[{success_count+fail_count+1}/{len(lines)}] Success: {biz_id}")
                success_count += 1
                if success_count % 100 == 0: print(f"Synced {success_count}...", end='\r')
            else:
                # print(f"[{success_count+fail_count+1}/{len(lines)}] Failed: {biz_id} - {resp.status_code}")
                fail_count += 1
                
        except json.JSONDecodeError:
            pass
        except Exception as e:
            fail_count += 1
            
    print(f"\nSync Complete for {backup_file}.")
    print(f"Success: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    file_to_sync = sys.argv[1] if len(sys.argv) > 1 else 'scraped_data_backup.jsonl'
    sync_data(file_to_sync)

