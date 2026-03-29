#!/usr/bin/env python3
"""
YELP FUSION API GAP FILLER
Uses Yelp's official API - 5000 free API calls per day!

SETUP (2 minutes):
1. Go to https://www.yelp.com/developers/v3/manage_app
2. Create an app (free)
3. Copy your API Key
4. Add to .env: YELP_API_KEY=your_key_here
5. Run: python scripts/fill_gaps_yelp_api.py
"""
import os
import json
import time
import random
import re
import uuid
import requests

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.environ.get("\ufeffVITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
YELP_API_KEY = os.getenv("YELP_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

if not YELP_API_KEY:
    print("[ERR] Missing YELP_API_KEY in .env")
    print("")
    print("FREE SETUP (2 minutes):")
    print("1. Go to: https://www.yelp.com/developers/v3/manage_app")
    print("2. Sign in / Create account")
    print("3. Click 'Create App'")
    print("4. Fill in app details (any name works)")
    print("5. Copy the API Key")
    print("6. Add to .env: YELP_API_KEY=your_key_here")
    print("")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Yelp category aliases
TRADE_CATEGORIES = {
    "plumber": "plumbing",
    "electrician": "electricians",
    "locksmith": "locksmiths",
    "hvac": "hvac",
    "roofer": "roofing",
    "drain-specialist": "plumbing",
    "glazier": "glassandmirrors",
    "builder": "contractors",
    "gas-engineer": "hvac",
    "water-restoration": "damage_restoration"
}

def search_yelp(trade, city, state):
    """Search Yelp Fusion API for businesses."""
    category = TRADE_CATEGORIES.get(trade, trade)
    
    url = "https://api.yelp.com/v3/businesses/search"
    headers = {
        "Authorization": f"Bearer {YELP_API_KEY}"
    }
    params = {
        "term": trade.replace("-", " "),
        "location": f"{city}, {state}",
        "categories": category,
        "limit": 10,
        "sort_by": "rating"
    }
    
    found = []
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        
        if resp.status_code == 200:
            data = resp.json()
            
            for biz in data.get("businesses", []):
                phone = biz.get("phone", "")
                name = biz.get("name", "")
                
                if not phone or not name:
                    continue
                
                # Normalize phone (remove +1 prefix)
                phone = re.sub(r'[^\d]', '', phone)
                if len(phone) == 11 and phone.startswith('1'):
                    phone = phone[1:]
                
                if len(phone) != 10:
                    continue
                
                location = biz.get("location", {})
                address = location.get("address1", "")
                
                found.append({
                    "name": name[:60],
                    "phone": phone,
                    "city": city,
                    "state": state,
                    "trade": trade,
                    "address": f"{address}, {city}, {state}" if address else f"{city}, {state}",
                    "rating": biz.get("rating"),
                    "review_count": biz.get("review_count", 0),
                    "source": "yelp_api"
                })
                
                if len(found) >= 5:
                    break
                    
        elif resp.status_code == 429:
            print("[WARN] Yelp API rate limit. Waiting 60s...", flush=True)
            time.sleep(60)
        elif resp.status_code == 401:
            print("[ERR] Invalid Yelp API key!", flush=True)
            exit(1)
            
    except Exception as e:
        print(f"[ERR] Yelp API error: {e}", flush=True)
    
    return found

def load_cities():
    """Load US cities with priority for larger ones."""
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return []
    
    cities = []
    seen = set()
    
    priority_states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI",
                       "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO"]
    
    if 'states' in data:
        for state in data['states']:
            state_code = state.get('code')
            is_priority = state_code in priority_states
            
            if 'metros' in state:
                for metro in state['metros']:
                    if 'cities' in metro:
                        for city in metro['cities']:
                            city_name = city.get('name')
                            if not city_name:
                                continue
                            key = f"{city_name}|{state_code}"
                            if key in seen:
                                continue
                            seen.add(key)
                            cities.append({
                                "city": city_name, 
                                "state": state_code, 
                                "priority": is_priority
                            })
    
    priority = [c for c in cities if c.get('priority')]
    other = [c for c in cities if not c.get('priority')]
    random.shuffle(priority)
    random.shuffle(other)
    
    return priority + other

def get_listing_count(trade, city):
    try:
        res = supabase.table("businesses").select("id", count="exact").eq("trade", trade).eq("city", city).eq("country_code", "US").execute()
        return res.count or 0
    except:
        return 0

def insert_business(biz, trade, city, state):
    """Insert business into Supabase."""
    try:
        exists = supabase.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).execute()
        if exists.data:
            return None
        
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
            "address": biz.get('address', f"{city}, {state}"),
            "website": "https://emergencytradesmen.net",
            "verified": True,
            "tier": "standard",
            "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
        }
        
        if biz.get('rating'):
            insert_data['rating'] = biz['rating']
        
        res = supabase.table("businesses").insert(insert_data).execute()
        if res.data:
            return res.data[0]['id']
        return None
    except:
        return None

def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)

def main():
    safe_print("[START] Yelp Fusion API Gap Filler")
    safe_print("[INFO] 5000 free API calls per day!")
    
    cities = load_cities()
    safe_print(f"[INFO] Loaded {len(cities)} cities")
    
    trades = list(TRADE_CATEGORIES.keys())
    stats = {"checked": 0, "filled": 0, "api_calls": 0}
    last_report = time.time()
    
    while True:
        for loc in cities:
            city = loc['city']
            state = loc['state']
            
            for trade in trades:
                count = get_listing_count(trade, city)
                if count >= 5:
                    continue
                
                needed = 5 - count
                safe_print(f"[GAP] {city}, {state} [{trade}]: {count}/5")
                stats["checked"] += 1
                
                results = search_yelp(trade, city, state)
                stats["api_calls"] += 1
                
                for biz in results[:needed]:
                    biz_id = insert_business(biz, trade, city, state)
                    if biz_id:
                        safe_print(f"  [OK] ADDED: {biz['name'][:40]} (Rating: {biz.get('rating', 'N/A')})")
                        stats["filled"] += 1
                
                if time.time() - last_report > 120:
                    safe_print(f"\n[STATS] Gaps: {stats['checked']} | Added: {stats['filled']} | API: {stats['api_calls']}\n")
                    last_report = time.time()
                
                # Small delay to respect rate limits
                time.sleep(0.3)
        
        safe_print(f"\n[CYCLE] Complete. Added: {stats['filled']}.\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[STOP] Interrupted")
