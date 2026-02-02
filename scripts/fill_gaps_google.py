#!/usr/bin/env python3
"""
GOOGLE PLACES GAP FILLER
Uses Google Places API - $200/month free credit from Google Cloud
Reliable, fast, and won't get blocked

SETUP:
1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable "Places API"
4. Create API key
5. Add to .env: GOOGLE_PLACES_API_KEY=your_key_here
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
GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

if not GOOGLE_API_KEY:
    print("[ERR] Missing GOOGLE_PLACES_API_KEY in .env")
    print("Get one free at: https://console.cloud.google.com/apis/library/places-backend.googleapis.com")
    print("Add to .env: GOOGLE_PLACES_API_KEY=your_key_here")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

TRADE_KEYWORDS = {
    "plumber": "plumber",
    "electrician": "electrician", 
    "locksmith": "locksmith",
    "hvac": "hvac contractor",
    "roofer": "roofing contractor",
    "drain-specialist": "drain cleaning",
    "glazier": "glass repair",
    "builder": "general contractor",
    "gas-engineer": "hvac",
    "water-restoration": "water damage restoration"
}

def search_google_places(trade, city, state):
    """Search Google Places API for businesses."""
    keyword = TRADE_KEYWORDS.get(trade, trade)
    query = f"{keyword} in {city}, {state}"
    
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    params = {
        "query": query,
        "key": GOOGLE_API_KEY,
        "type": "establishment"
    }
    
    found = []
    try:
        resp = requests.get(url, params=params, timeout=15)
        data = resp.json()
        
        if data.get("status") == "OK":
            for place in data.get("results", [])[:10]:
                place_id = place.get("place_id")
                name = place.get("name", "")
                
                if not place_id or not name:
                    continue
                
                # Get details including phone number
                details = get_place_details(place_id)
                if details and details.get("phone"):
                    found.append({
                        "name": name[:60],
                        "phone": details["phone"],
                        "city": city,
                        "state": state,
                        "trade": trade,
                        "address": details.get("address", f"{city}, {state}"),
                        "rating": details.get("rating"),
                        "source": "google"
                    })
                    
                    if len(found) >= 5:
                        break
                        
        elif data.get("status") == "OVER_QUERY_LIMIT":
            print("[WARN] Google API quota exceeded. Waiting 60s...", flush=True)
            time.sleep(60)
        elif data.get("status") == "REQUEST_DENIED":
            print(f"[ERR] Google API denied: {data.get('error_message')}", flush=True)
            
    except Exception as e:
        print(f"[ERR] Google search failed: {e}", flush=True)
    
    return found

def get_place_details(place_id):
    """Get detailed info including phone number."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "key": GOOGLE_API_KEY,
        "fields": "formatted_phone_number,formatted_address,rating,reviews"
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()
        
        if data.get("status") == "OK":
            result = data.get("result", {})
            phone = result.get("formatted_phone_number", "")
            
            if phone:
                # Normalize phone
                phone = re.sub(r'[^\d]', '', phone)
                if len(phone) == 10 or (len(phone) == 11 and phone.startswith('1')):
                    if len(phone) == 11:
                        phone = phone[1:]
                    
                    return {
                        "phone": phone,
                        "address": result.get("formatted_address", ""),
                        "rating": result.get("rating"),
                        "reviews": result.get("reviews", [])
                    }
    except:
        pass
    
    return None

def load_cities():
    """Load US cities, prioritizing larger metros."""
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return []
    
    cities = []
    seen = set()
    
    priority_states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"]
    
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
    
    # Sort by priority
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
        # Check duplicates
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
    except Exception as e:
        return None

def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)

def main():
    safe_print("[START] Google Places Gap Filler")
    safe_print("[INFO] Using Google Places API - reliable and fast!")
    
    cities = load_cities()
    safe_print(f"[INFO] Loaded {len(cities)} cities")
    
    trades = list(TRADE_KEYWORDS.keys())
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
                
                results = search_google_places(trade, city, state)
                stats["api_calls"] += 1
                
                for biz in results[:needed]:
                    biz_id = insert_business(biz, trade, city, state)
                    if biz_id:
                        safe_print(f"  [OK] ADDED: {biz['name'][:40]}")
                        stats["filled"] += 1
                
                # Progress report every 2 minutes
                if time.time() - last_report > 120:
                    safe_print(f"\n[STATS] Gaps: {stats['checked']} | Added: {stats['filled']} | API Calls: {stats['api_calls']}\n")
                    last_report = time.time()
                
                # Respect rate limits
                time.sleep(0.2)
        
        safe_print(f"\n[CYCLE] Complete. Added: {stats['filled']}. Restarting...\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[STOP] Interrupted")
