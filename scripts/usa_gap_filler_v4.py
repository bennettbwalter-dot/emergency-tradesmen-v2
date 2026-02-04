import os
import json
import time
import random
import re
import uuid
import sys
from datetime import datetime

# Fix console encoding
os.environ['PYTHONIOENCODING'] = 'utf-8'

import cloudscraper
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Configuration ---
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
if not SUPABASE_URL:
    SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL") # Handle BOM

SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: Missing Supabase credentials.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Logging
LOG_FILE = "usa_gap_fill_v4.log"
HEARTBEAT_FILE = "gap_fill_heartbeat.json"

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted = f"[{timestamp}] {msg}"
    print(formatted)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(formatted + "\n")

def update_heartbeat(stats):
    with open(HEARTBEAT_FILE, "w") as f:
        json.dump({
            "last_active": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "stats": stats
        }, f, indent=2)

# Source Status & Cooldowns
SOURCE_STATUS = {
    "yp": {"last_fail": 0, "cooldown": 0},
    "yelp": {"last_fail": 0, "cooldown": 0},
    "manta": {"last_fail": 0, "cooldown": 0}
}

# ============ SCRAPING FUNCTIONS ============

def search_yp(trade, city, state):
    yp_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain cleaning",
        "breakdown": "towing", "glazier": "glass repair",
        "water-restoration": "water damage restoration", "builder": "general contractor"
    }
    term = yp_terms.get(trade, trade)
    url = f"https://www.yellowpages.com/search?search_terms={term}&geo_location_terms={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        response = scraper.get(url, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            for res in soup.find_all('div', class_='result')[:6]:
                name_tag = res.find('a', class_='business-name')
                phone_tag = res.find('div', class_='phones')
                if not name_tag or not phone_tag: continue
                name = name_tag.get_text().strip()
                phone = phone_tag.get_text().strip()
                if any(x in name.lower() for x in ['yellow pages', 'directory', 'top 10']): continue
                
                rating = None
                review_snippet = None
                rating_tag = res.find('div', class_='ratings')
                if rating_tag:
                    rating_class = rating_tag.get('class', [])
                    for cls in rating_class:
                        if cls in ['one', 'two', 'three', 'four', 'five']:
                            rating = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5}.get(cls)
                            break
                
                review_tag = res.find('p', class_='body') or res.find('div', class_='snippet')
                if review_tag:
                    review_snippet = review_tag.get_text().strip()[:500]
                
                found.append({
                    "name": name, "phone": phone, "city": city, "state": state, 
                    "trade": trade, "country_code": "US", "source": "yp",
                    "rating": rating, "review_snippet": review_snippet
                })
        elif response.status_code in [403, 429]: return None
    except: pass
    return found

def search_yelp(trade, city, state):
    yelp_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain+cleaning",
        "breakdown": "towing", "glazier": "glass+repair",
        "water-restoration": "water+damage", "builder": "contractors"
    }
    term = yelp_terms.get(trade, trade)
    url = f"https://www.yelp.com/search?find_desc={term}&find_loc={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        response = scraper.get(url, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            for biz in soup.select('[data-testid="serp-ia-card"]')[:6]:
                name_el = biz.select_one('a[name]') or biz.select_one('h3 a')
                phone_el = biz.select_one('[class*="phone"]')
                if not name_el: continue
                name = name_el.get_text().strip()
                phone = phone_el.get_text().strip() if phone_el else ""
                if not phone or len(phone) < 10: continue
                found.append({"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "yelp"})
        elif response.status_code in [403, 429]: return None
    except: pass
    return found

def search_manta(trade, city, state):
    manta_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain-cleaning",
        "breakdown": "towing-service", "glazier": "glass-repair",
        "water-restoration": "water-damage-restoration", "builder": "general-contractors"
    }
    term = manta_terms.get(trade, trade)
    url = f"https://www.manta.com/search?search={term}&search_location={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        response = scraper.get(url, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            for tel_link in soup.select('a[href^="tel:"]'):
                phone = tel_link.get('href', '').replace('tel:', '').strip()
                if not phone or len(phone) < 10: continue
                
                parent_flex = tel_link.find_parent('div', class_='flex')
                if not parent_flex: continue
                
                name_el = parent_flex.find_parent('div').select_one('a[class*="hover:text-primary"], h2 a, .company-name')
                if not name_el: continue
                
                name = name_el.get_text().strip()
                if not name or any(x in name.lower() for x in ['search', 'manta', 'login']): continue
                
                found.append({"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "manta"})
                if len(found) >= 6: break
        elif response.status_code in [403, 429]: return None
    except: pass
    return found

def search_multi(trade, city, state):
    sources = [("yp", search_yp), ("yelp", search_yelp), ("manta", search_manta)]
    random.shuffle(sources)
    
    now = time.time()
    for name, fn in sources:
        status = SOURCE_STATUS[name]
        if now - status["last_fail"] < status["cooldown"]:
            continue
            
        res = fn(trade, city, state)
        if res is None: # Blocked
            log(f"   [BLOCK] {name.upper()} blocked us. Cooling down 15m.")
            SOURCE_STATUS[name]["last_fail"] = now
            SOURCE_STATUS[name]["cooldown"] = 900
            continue
            
        if res:
            return res
            
    return []

# ============ MAIN LOOP ============

def run_filler():
    log("🚀 Starting USA Master Gap-Filler v4...")
    
    # Load Gaps
    gap_file = os.path.join(os.path.dirname(__file__), "us_listing_gaps.json")
    if not os.path.exists(gap_file):
        log("❌ Error: us_listing_gaps.json not found. run scripts/analyze_us_gaps.js first.")
        return

    with open(gap_file, "r", encoding="utf-8") as f:
        gaps = json.load(f)
    
    log(f"📊 Loaded {len(gaps)} gaps to fill.")
    
    stats = {"checked": 0, "filled": 0, "errors": 0}
    
    for i, gap in enumerate(gaps):
        city = gap['city']
        state = gap['state']
        trade = gap['trade']
        needed = gap['needed']
        
        log(f"👉 ({i+1}/{len(gaps)}) {city}, {state} | {trade} | Needs {needed}")
        
        stats["checked"] += 1
        update_heartbeat(stats)
        
        # Double check live count (some gaps might have been filled by other scripts)
        res = supabase.table("businesses").select("id", count="exact")\
            .eq("country_code", "US").eq("city", city).eq("trade", trade).execute()
        
        if res.count >= 5:
            log(f"   [DONE] Already has {res.count} listings.")
            continue
            
        found = search_multi(trade, city, state)
        
        if not found:
            log(f"   [EMPTY] No listings found for {city} {trade}.")
            time.sleep(1)
            continue
            
        added_count = 0
        for biz in found:
            if res.count + added_count >= 5: break
            
            try:
                # Dedupe by phone
                check = supabase.table("businesses").select("id").eq("phone", biz['phone']).execute()
                if check.data: continue
                
                # Insert
                safe_name = re.sub(r'[^a-zA-Z0-9]', '-', biz['name'].lower())
                safe_city = re.sub(r'[^a-zA-Z0-9]', '-', city.lower())
                slug = f"{safe_name}-{safe_city}-{str(uuid.uuid4())[:8]}"
                
                insert_data = {
                    "id": str(uuid.uuid4()),
                    "name": biz['name'],
                    "slug": slug,
                    "trade": trade,
                    "city": city,
                    "country_code": "US",
                    "phone": biz['phone'],
                    "address": f"{city}, {state}",
                    "website": "https://emergencytradesmen.net",
                    "verified": True,
                    "tier": "standard",
                    "created_at": datetime.now(datetime.UTC).isoformat()
                }
                
                res_ins = supabase.table("businesses").insert(insert_data).execute()
                if res_ins.data:
                    biz_id = res_ins.data[0]['id']
                    added_count += 1
                    stats["filled"] += 1
                    log(f"      [OK] Added: {biz['name']}")
                    
                    # Add review if available
                    if biz.get('review_snippet'):
                        try:
                            supabase.table("reviews").insert({
                                "business_id": biz_id,
                                "user_name": "Verified Customer",
                                "rating": biz.get('rating', 5),
                                "comment": biz['review_snippet'],
                                "title": f"Verified Review via {biz['source'].upper()}",
                                "verified_purchase": True,
                                "created_at": datetime.now(datetime.UTC).isoformat()
                            }).execute()
                        except: pass
            except:
                stats["errors"] += 1
                continue
                
        log(f"   [COMPLETE] Added {added_count} new listings.")
        time.sleep(random.uniform(2, 5)) # Human-like delay

    log("🏁 Finished one full pass of gaps.")

if __name__ == "__main__":
    while True:
        try:
            run_filler()
            log("💤 Pass complete. Sleeping 1 hour before re-scanning...")
            time.sleep(3600)
        except KeyboardInterrupt:
            log("🛑 Stopped by user.")
            break
        except Exception as e:
            log(f"💥 CRITICAL ERROR: {e}")
            time.sleep(60)
