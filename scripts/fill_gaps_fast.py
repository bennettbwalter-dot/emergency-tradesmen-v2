#!/usr/bin/env python3
"""
FAST GAP FILLER - Direct search with smart retry
Uses Bing search primarily (more forgiving) + direct YP/Manta with rotation
"""
import os
import json
import time
import random
import re
import uuid
import requests
from bs4 import BeautifulSoup
from concurrent.futures import ThreadPoolExecutor, as_completed

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

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

TRADES = [
    "plumber", "electrician", "locksmith", "hvac", "roofer", 
    "drain-specialist", "glazier", "builder"
]

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
]

def get_headers():
    return {
        'User-Agent': random.choice(USER_AGENTS),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }

def search_duckduckgo(trade, city, state):
    """Search DuckDuckGo - very forgiving with scraping."""
    query = f"{trade} near {city} {state} phone number"
    url = f"https://html.duckduckgo.com/html/?q={query.replace(' ', '+')}"
    
    found = []
    try:
        resp = requests.get(url, headers=get_headers(), timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            for result in soup.select('.result')[:15]:
                text = result.get_text()
                # Look for phone numbers
                phone_matches = re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
                
                for phone_match in phone_matches[:1]:
                    phone = re.sub(r'[^\d]', '', phone_match)
                    if len(phone) != 10:
                        continue
                    
                    # Get title as business name
                    title = result.select_one('.result__title')
                    if title:
                        name = title.get_text().strip()
                        # Clean up
                        name = re.sub(r'\s*[-|–].*$', '', name).strip()
                        name = re.sub(r'\s+', ' ', name)
                        
                        if name and len(name) > 3 and len(name) < 80:
                            # Skip obvious non-businesses
                            skip_words = ['yelp', 'yellowpages', 'mapquest', 'facebook', 'linkedin', 'wikipedia']
                            if not any(w in name.lower() for w in skip_words):
                                found.append({
                                    "name": name[:60],
                                    "phone": phone,
                                    "city": city,
                                    "state": state,
                                    "trade": trade,
                                    "source": "ddg"
                                })
                                if len(found) >= 5:
                                    break
    except Exception as e:
        pass
    
    return found

def search_bing(trade, city, state):
    """Search Bing for local businesses."""
    trade_terms = {
        "plumber": "plumber plumbing",
        "electrician": "electrician electrical",
        "locksmith": "locksmith lock",
        "hvac": "hvac heating cooling",
        "roofer": "roofer roofing",
        "drain-specialist": "drain cleaning plumber",
        "glazier": "glass repair window",
        "builder": "contractor builder construction"
    }
    term = trade_terms.get(trade, trade)
    query = f"{term} {city} {state} phone"
    url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
    
    found = []
    try:
        resp = requests.get(url, headers=get_headers(), timeout=10)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            # Search in result text
            for result in soup.select('.b_algo')[:15]:
                text = result.get_text()
                phone_matches = re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
                
                if phone_matches:
                    phone = re.sub(r'[^\d]', '', phone_matches[0])
                    if len(phone) == 10:
                        title = result.select_one('h2')
                        if title:
                            name = title.get_text().strip()
                            name = re.sub(r'\s*[-|–].*$', '', name).strip()
                            
                            if name and len(name) > 3 and len(name) < 80:
                                skip_words = ['yelp', 'yellowpages', 'facebook', 'indeed']
                                if not any(w in name.lower() for w in skip_words):
                                    found.append({
                                        "name": name[:60],
                                        "phone": phone,
                                        "city": city,
                                        "state": state,
                                        "trade": trade,
                                        "source": "bing"
                                    })
                                    if len(found) >= 5:
                                        break
    except:
        pass
    
    return found

def search_all(trade, city, state):
    """Try all search methods."""
    # Try DuckDuckGo first (most forgiving)
    results = search_duckduckgo(trade, city, state)
    if results:
        return results
    
    # Fallback to Bing
    time.sleep(0.5)
    results = search_bing(trade, city, state)
    return results

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
    
    # Priority states with high population
    priority_states = ["CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI", 
                       "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "CO"]
    
    if 'states' in data:
        # First pass: priority states
        for state in data['states']:
            state_code = state.get('code')
            if state_code not in priority_states:
                continue
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
                            cities.append({"city": city_name, "state": state_code, "priority": True})
        
        # Second pass: other states
        for state in data['states']:
            state_code = state.get('code')
            if state_code in priority_states:
                continue
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
                            cities.append({"city": city_name, "state": state_code, "priority": False})
    
    # Shuffle within priority groups
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
            return False
        
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
        
        res = supabase.table("businesses").insert(insert_data).execute()
        return bool(res.data)
    except:
        return False

def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)

def main():
    safe_print("[START] Fast Gap Filler (DDG + Bing)")
    
    cities = load_cities()
    safe_print(f"[INFO] Loaded {len(cities)} cities (priority states first)")
    
    stats = {"checked": 0, "filled": 0, "searches": 0}
    last_report = time.time()
    
    while True:
        for loc in cities:
            city = loc['city']
            state = loc['state']
            
            for trade in TRADES:
                count = get_listing_count(trade, city)
                if count >= 5:
                    continue
                
                needed = 5 - count
                safe_print(f"[GAP] {city}, {state} [{trade}]: {count}/5")
                stats["checked"] += 1
                
                results = search_all(trade, city, state)
                stats["searches"] += 1
                
                for biz in results[:needed]:
                    if not biz.get('phone') or len(biz['phone']) < 10:
                        continue
                    
                    if insert_business(biz, trade, city, state):
                        safe_print(f"  [OK] ADDED: {biz['name'][:40]} ({biz['source']})")
                        stats["filled"] += 1
                
                # Progress report every 2 minutes
                if time.time() - last_report > 120:
                    safe_print(f"\n[STATS] Checked: {stats['checked']} | Filled: {stats['filled']} | Searches: {stats['searches']}\n")
                    last_report = time.time()
                
                # Small randomized delay
                time.sleep(random.uniform(0.5, 1.5))
        
        safe_print(f"\n[CYCLE] Complete. Added: {stats['filled']}. Restarting...\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[STOP] Interrupted")
