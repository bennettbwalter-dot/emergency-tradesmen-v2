#!/usr/bin/env python3
"""
FOURSQUARE PLACES API GAP FILLER
Uses Foursquare's free Places API - 100,000 free calls per month!

SETUP (2 minutes):
1. Go to: https://foursquare.com/developers/signup
2. Create free account
3. Create a new project
4. Copy your API Key
5. Add to .env: FOURSQUARE_API_KEY=your_key_here
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
FOURSQUARE_API_KEY = os.getenv("FOURSQUARE_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

if not FOURSQUARE_API_KEY:
    print("[ERR] Missing FOURSQUARE_API_KEY in .env")
    print("")
    print("FREE SETUP (2 minutes):")
    print("1. Go to: https://foursquare.com/developers/signup")
    print("2. Create free account & project")
    print("3. Copy your API Key")
    print("4. Add to .env: FOURSQUARE_API_KEY=your_key_here")
    print("")
    print("FREE TIER: 100,000 API calls per month!")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Foursquare category IDs
TRADE_CATEGORIES = {
    "plumber": "11118",  # Plumber
    "electrician": "11031",  # Electrician
    "locksmith": "11082",  # Locksmith
    "hvac": "11073",  # HVAC
    "roofer": "11128",  # Roofing
    "drain-specialist": "11118",  # Plumber
    "glazier": "11063",  # Glass & Mirror
    "builder": "11019",  # Contractor
    "gas-engineer": "11073",  # HVAC
    "water-restoration": "11186"  # Restoration
}

# US State coordinates for better search
STATE_COORDS = {
    "CA": (36.7783, -119.4179), "TX": (31.9686, -99.9018), "FL": (27.6648, -81.5158),
    "NY": (43.0000, -75.0000), "PA": (41.2033, -77.1945), "IL": (40.6331, -89.3985),
    "OH": (40.4173, -82.9071), "GA": (32.1656, -82.9001), "NC": (35.7596, -79.0193),
    "MI": (44.3148, -85.6024), "NJ": (40.0583, -74.4057), "VA": (37.4316, -78.6569),
    "WA": (47.7511, -120.7401), "AZ": (34.0489, -111.0937), "MA": (42.4072, -71.3824),
    "TN": (35.5175, -86.5804), "IN": (40.2672, -86.1349), "MO": (37.9643, -91.8318),
    "MD": (39.0458, -76.6413), "CO": (39.5501, -105.7821),
}

def search_foursquare(trade, city, state):
    """Search Foursquare Places API."""
    category = TRADE_CATEGORIES.get(trade, "11000")  # Default to services
    
    url = "https://api.foursquare.com/v3/places/search"
    headers = {
        "Authorization": FOURSQUARE_API_KEY,
        "Accept": "application/json"
    }
    
    # Get state coords for better results
    coords = STATE_COORDS.get(state, (39.8283, -98.5795))  # Default to US center
    
    params = {
        "query": f"{trade.replace('-', ' ')} {city}",
        "near": f"{city}, {state}, USA",
        "categories": category,
        "limit": 10,
        "sort": "RELEVANCE"
    }
    
    found = []
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=15)
        
        if resp.status_code == 200:
            data = resp.json()
            
            for place in data.get("results", []):
                name = place.get("name", "")
                
                # Get phone from tel field
                phone = place.get("tel", "")
                if not phone:
                    continue
                
                # Normalize phone
                phone = re.sub(r'[^\d]', '', phone)
                if len(phone) == 11 and phone.startswith('1'):
                    phone = phone[1:]
                
                if len(phone) != 10:
                    continue
                
                location = place.get("location", {})
                address = location.get("formatted_address", f"{city}, {state}")
                
                found.append({
                    "name": name[:60],
                    "phone": phone,
                    "city": city,
                    "state": state,
                    "trade": trade,
                    "address": address,
                    "source": "foursquare"
                })
                
                if len(found) >= 5:
                    break
                    
        elif resp.status_code == 429:
            print("[WARN] Foursquare rate limit. Waiting 60s...", flush=True)
            time.sleep(60)
        elif resp.status_code == 401:
            print("[ERR] Invalid Foursquare API key!", flush=True)
            exit(1)
            
    except Exception as e:
        print(f"[ERR] Foursquare error: {e}", flush=True)
    
    return found

def load_cities():
    """Load US cities."""
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return []
    
    cities = []
    seen = set()
    
    if 'states' in data:
        for state in data['states']:
            state_code = state.get('code')
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
                            cities.append({"city": city_name, "state": state_code})
    
    random.shuffle(cities)
    return cities

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
        
        res = supabase.table("businesses").insert(insert_data).execute()
        return res.data[0]['id'] if res.data else None
    except:
        return None

def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)

def main():
    safe_print("[START] Foursquare Places API Gap Filler")
    safe_print("[INFO] 100,000 free API calls per month!")
    
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
                
                results = search_foursquare(trade, city, state)
                stats["api_calls"] += 1
                
                for biz in results[:needed]:
                    biz_id = insert_business(biz, trade, city, state)
                    if biz_id:
                        safe_print(f"  [OK] ADDED: {biz['name'][:40]}")
                        stats["filled"] += 1
                
                if time.time() - last_report > 120:
                    safe_print(f"\n[STATS] Gaps: {stats['checked']} | Added: {stats['filled']} | API: {stats['api_calls']}\n")
                    last_report = time.time()
                
                time.sleep(0.2)  # Respect rate limits
        
        safe_print(f"\n[CYCLE] Complete. Added: {stats['filled']}.\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[STOP] Interrupted")
