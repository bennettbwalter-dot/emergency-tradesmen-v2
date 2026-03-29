#!/usr/bin/env python3
import os
import json
import time
import uuid
import re
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

QUEUE_FILE = os.path.join(os.path.dirname(__file__), 'verified_listings_queue.json')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'background_filler.log')

def log(msg):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {msg}\n")
    print(f"[{timestamp}] {msg}")

class BackgroundFiller:
    def __init__(self):
        url = os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        self.sb = create_client(url, key)
        log("Background Filler Initialized.")

    def process_queue(self):
        while True:
            try:
                if not os.path.exists(QUEUE_FILE):
                    time.sleep(10)
                    continue

                with open(QUEUE_FILE, 'r') as f:
                    try:
                        queue = json.load(f)
                    except json.JSONDecodeError:
                        queue = []

                if not queue:
                    time.sleep(10)
                    continue

                log(f"Processing {len(queue)} items from queue...")
                remaining = []
                
                for item in queue:
                    try:
                        if self.insert_item(item):
                            log(f"SUCCESS: Inserted {item['name']} in {item['city']}, {item.get('state', 'US')}")
                        else:
                            log(f"INFO: Skipped (Duplicate or Error): {item['name']}")
                    except Exception as e:
                        log(f"ERROR: Error inserting {item.get('name', 'Unknown')}: {str(e)}")
                        remaining.append(item)

                # Update queue with remaining or empty list
                with open(QUEUE_FILE, 'w') as f:
                    json.dump(remaining, f, indent=4)
                
                log("Queue cycle complete.")
                time.sleep(30) # Poll every 30 seconds

            except Exception as e:
                log(f"CRITICAL ERROR in main loop: {str(e)}")
                time.sleep(60)

    def insert_item(self, biz):
        if not biz.get('phone'): return False
        
        trade = biz['trade']
        city = biz['city']
        country_code = biz.get('country_code', 'US')
        
        # Check for duplicates
        exists = self.sb.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).eq("country_code", country_code).execute()
        if exists.data: return False

        slug = f"{re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')}-{str(uuid.uuid4())[:8]}"
        
        data = {
            "id": str(uuid.uuid4()),
            "name": biz['name'],
            "slug": slug,
            "trade": trade,
            "city": city,
            "country_code": country_code,
            "phone": biz['phone'],
            "address": biz.get('address') or city,
            "verified": True,
            "tier": "standard",
            "created_at": datetime.now().isoformat(),
            "website": biz.get('website'),
            "rating": biz.get('rating'),
            "review_count": biz.get('review_count', 0)
        }
        
        res = self.sb.table("businesses").insert(data).execute()
        return True

if __name__ == "__main__":
    BackgroundFiller().process_queue()
