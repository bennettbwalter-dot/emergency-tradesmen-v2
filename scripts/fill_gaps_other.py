#!/usr/bin/env python3
"""
OTHER REGIONAL WORKER
States: MT, ID, WY, PR, GU, VI + any remaining
"""
import os
import json
import time
import random
import re
import uuid
import sys

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
     SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL")

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    import sys
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# REGION CONFIG
REGION_NAME = "OTHER"
TARGET_STATES = ["MT", "ID", "WY", "PR", "GU", "VI"]

TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
]

SOURCE_STATUS = {
    "yp": {"last_fail": 0, "cooldown": 0},
    "yelp": {"last_fail": 0, "cooldown": 0},
    "manta": {"last_fail": 0, "cooldown": 0}
}

def load_cities_for_region():
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERR] Error loading us_cities.json: {e}")
        return []

    cities = []
    seen = set()

    if 'states' in data:
        for state in data['states']:
            state_code = state.get('code')
            if state_code not in TARGET_STATES:
                continue
            if 'metros' in state:
                for metro in state['metros']:
                    metro_name = metro.get('name')
                    if 'cities' in metro:
                        for city in metro['cities']:
                            city_name = city.get('name')
                            if not city_name: continue
                            key = f"{city_name}|{state_code}"
                            if key in seen: continue
                            seen.add(key)
                            cities.append({"city": city_name, "state": state_code, "metro": metro_name})
                            if 'suburbs' in city:
                                for sub in city['suburbs']:
                                    sub_name = sub.get('name')
                                    if sub_name:
                                        s_key = f"{sub_name}|{state_code}"
                                        if s_key not in seen:
                                            seen.add(s_key)
                                            cities.append({"city": sub_name, "state": state_code, "metro": metro_name})

    random.shuffle(cities)
    print(f"[{REGION_NAME}] Loaded {len(cities)} cities.", flush=True)
    return cities

def search_yp(trade, city, state):
    yp_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain+cleaning",
        "breakdown": "towing", "glazier": "glass+repair",
        "water-restoration": "water+damage", "builder": "general+contractors"
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
                biz_data = {"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "yp"}
                if rating: biz_data["rating"] = rating
                if review_snippet: biz_data["review_snippet"] = review_snippet
                found.append(biz_data)
        elif response.status_code in [403, 429]:
            return None
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
                grandparent = parent_flex.find_parent('div')
                if not grandparent: continue
                name_el = grandparent.select_one('a[class*="hover:text-primary"], h2 a, .company-name')
                if not name_el:
                    top = grandparent.find_parent('div')
                    if top:
                        name_el = top.select_one('a[class*="hover:text-primary"], h2 a, .company-name')
                if not name_el: continue
                name = name_el.get_text().strip()
                if not name or any(x in name.lower() for x in ['search', 'manta', 'login']): continue
                found.append({"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "manta"})
                if len(found) >= 6: break
        elif response.status_code in [403, 429]:
            return None
    except: pass
    return found

def search_businesses_multi(trade, city, state):
    sources = [("yp", search_yp), ("manta", search_manta)]
    random.shuffle(sources)
    now = time.time()
    for src_name, src_fn in sources:
        status = SOURCE_STATUS[src_name]
        if now < status["last_fail"] + status["cooldown"]:
            continue
        result = src_fn(trade, city, state)
        if result is None:
            status["last_fail"] = now
            status["cooldown"] = 600
            print(f"      [STOP] {src_name.upper()} blocked. Cool-down 10m.", flush=True)
            continue
        if result:
            return result
    all_blocked = all(now < SOURCE_STATUS[s]["last_fail"] + SOURCE_STATUS[s]["cooldown"] for s in SOURCE_STATUS)
    if all_blocked:
        print(f"[ERR] All sources in cool-down. Waiting 30s...", flush=True)
        time.sleep(30)
    return []

def get_listing_count(trade, city):
    try:
        res = supabase.table("businesses").select("id", count="exact").eq("trade", trade).eq("city", city).eq("country_code", "US").execute()
        return res.count or 0
    except:
        return 0

def loop_forever():
    print(f"[START] {REGION_NAME} Worker - Targeting {len(TARGET_STATES)} states", flush=True)
    all_locations = load_cities_for_region()
    if not all_locations:
        print("[ERR] No cities loaded.")
        return

    stats = {"checked": 0, "filled": 0}
    while True:
        for loc in all_locations:
            city = loc['city']
            state = loc['state']
            for trade in TRADES:
                current_count = get_listing_count(trade, city)
                if current_count >= 5:
                    continue
                needed = 5 - current_count
                print(f"[GAP] {city}, {state} [{trade}]: Has {current_count}/5", flush=True)
                stats["checked"] += 1
                potential_listings = search_businesses_multi(trade, city, state)
                if not potential_listings:
                    continue
                for biz in potential_listings[:needed]:
                    if not biz.get('phone') or len(biz['phone']) < 10:
                        continue
                    try:
                        exists = supabase.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).execute()
                        if exists.data:
                            continue
                        safe_name = re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')[:50]
                        safe_city = re.sub(r'[^a-z0-9]+', '-', city.lower()).strip('-')[:30]
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
                            "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
                        }
                        try:
                            res = supabase.table("businesses").insert(insert_data).execute()
                            if res.data:
                                biz_id = res.data[0]['id']
                                print(f"      [OK] ADDED: {biz['name']} ({trade})", flush=True)
                                stats["filled"] += 1
                                if biz.get('review_snippet'):
                                    try:
                                        supabase.table("reviews").insert({
                                            "business_id": biz_id,
                                            "user_name": "Verified Customer",
                                            "rating": biz.get('rating', 5),
                                            "comment": biz['review_snippet'],
                                            "title": f"Review from {biz.get('source', 'directory').upper()}",
                                            "verified_purchase": True,
                                            "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
                                        }).execute()
                                        print(f"         [REVIEWS] Added 1 review", flush=True)
                                    except: pass
                                time.sleep(1)
                        except Exception as e:
                            print(f"      [ERR] Insertion failed: {e}", flush=True)
                            continue
                    except Exception as insert_err:
                        print(f"      [ERR] {insert_err}", flush=True)
                        continue
                time.sleep(random.uniform(0.5, 1.5))
        print(f"\n[{REGION_NAME}] Cycle complete. Filled: {stats['filled']}. Restarting...\n", flush=True)

if __name__ == "__main__":
    try:
        loop_forever()
    except KeyboardInterrupt:
        print(f"[{REGION_NAME}] Stopped.")
