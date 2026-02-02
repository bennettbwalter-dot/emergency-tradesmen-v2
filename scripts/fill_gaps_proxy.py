#!/usr/bin/env python3
"""
PROXY-ENABLED GAP FILLER
Uses free proxy rotation to bypass IP blocks.
"""
import os
import json
import time
import random
import re
import uuid
import requests
from bs4 import BeautifulSoup

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
    "drain-specialist", "glazier", "builder", "water-restoration"
]

# Proxy management
PROXY_LIST = []
PROXY_INDEX = 0
LAST_PROXY_REFRESH = 0

def fetch_fresh_proxies():
    """Fetch fresh proxies from multiple free sources."""
    global PROXY_LIST, LAST_PROXY_REFRESH
    proxies = []
    
    sources = [
        "https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=US&ssl=all&anonymity=all",
        "https://www.proxy-list.download/api/v1/get?type=http&anon=elite&country=US",
    ]
    
    for url in sources:
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                for line in resp.text.strip().split('\n'):
                    line = line.strip()
                    if ':' in line and len(line) < 25:
                        proxies.append(f"http://{line}")
        except:
            pass
    
    # Add some known working free proxies as fallback
    fallback_proxies = [
        "http://38.154.227.167:5868",
        "http://185.199.229.156:7492",
        "http://185.199.228.220:7300",
    ]
    proxies.extend(fallback_proxies)
    
    random.shuffle(proxies)
    PROXY_LIST = proxies[:50]  # Keep top 50
    LAST_PROXY_REFRESH = time.time()
    print(f"[PROXY] Loaded {len(PROXY_LIST)} proxies", flush=True)
    return len(PROXY_LIST) > 0

def get_next_proxy():
    """Get next proxy from rotation."""
    global PROXY_INDEX, LAST_PROXY_REFRESH
    
    # Refresh proxies every 30 minutes
    if time.time() - LAST_PROXY_REFRESH > 1800:
        fetch_fresh_proxies()
    
    if not PROXY_LIST:
        return None
    
    proxy = PROXY_LIST[PROXY_INDEX % len(PROXY_LIST)]
    PROXY_INDEX += 1
    return {"http": proxy, "https": proxy}

def search_with_proxy(trade, city, state):
    """Search using proxy rotation with multiple sources."""
    # Try different search engines/directories
    search_functions = [
        search_yp_proxy,
        search_manta_proxy,
        search_bing_local,
    ]
    random.shuffle(search_functions)
    
    for search_fn in search_functions:
        try:
            result = search_fn(trade, city, state)
            if result:
                return result
        except Exception as e:
            continue
    
    return []

def search_yp_proxy(trade, city, state):
    """Search YellowPages with proxy."""
    proxy = get_next_proxy()
    yp_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain+cleaning",
        "breakdown": "towing", "glazier": "glass+repair",
        "water-restoration": "water+damage", "builder": "general+contractors"
    }
    term = yp_terms.get(trade, trade)
    url = f"https://www.yellowpages.com/search?search_terms={term}&geo_location_terms={city}%2C+{state}"
    
    headers = {
        'User-Agent': random.choice([
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        ])
    }
    
    found = []
    try:
        resp = requests.get(url, headers=headers, proxies=proxy, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            for res in soup.find_all('div', class_='result')[:6]:
                name_tag = res.find('a', class_='business-name')
                phone_tag = res.find('div', class_='phones')
                if not name_tag or not phone_tag:
                    continue
                name = name_tag.get_text().strip()
                phone = phone_tag.get_text().strip()
                if any(x in name.lower() for x in ['yellow pages', 'directory', 'top 10']):
                    continue
                found.append({
                    "name": name, "phone": phone, "city": city, 
                    "state": state, "trade": trade, "source": "yp"
                })
    except:
        pass
    return found

def search_manta_proxy(trade, city, state):
    """Search Manta with proxy."""
    proxy = get_next_proxy()
    manta_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain-cleaning",
        "breakdown": "towing-service", "glazier": "glass-repair",
        "water-restoration": "water-damage-restoration", "builder": "general-contractors"
    }
    term = manta_terms.get(trade, trade)
    url = f"https://www.manta.com/search?search={term}&search_location={city}%2C+{state}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
    
    found = []
    try:
        resp = requests.get(url, headers=headers, proxies=proxy, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            for tel_link in soup.select('a[href^="tel:"]')[:6]:
                phone = tel_link.get('href', '').replace('tel:', '').strip()
                if not phone or len(phone) < 10:
                    continue
                parent = tel_link.find_parent('div')
                if not parent:
                    continue
                name_el = parent.find_parent('div')
                if name_el:
                    name_link = name_el.select_one('a[class*="hover:text-primary"], h2 a')
                    if name_link:
                        name = name_link.get_text().strip()
                        if name and 'manta' not in name.lower():
                            found.append({
                                "name": name, "phone": phone, "city": city,
                                "state": state, "trade": trade, "source": "manta"
                            })
    except:
        pass
    return found

def search_bing_local(trade, city, state):
    """Search Bing for local businesses - less aggressive blocking."""
    proxy = get_next_proxy()
    query = f"{trade} {city} {state} phone"
    url = f"https://www.bing.com/search?q={query.replace(' ', '+')}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    }
    
    found = []
    try:
        resp = requests.get(url, headers=headers, proxies=proxy, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            # Look for local pack results
            for result in soup.select('.b_algo')[:10]:
                text = result.get_text()
                # Extract phone numbers
                phone_match = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
                if phone_match:
                    phone = re.sub(r'[^\d]', '', phone_match.group())
                    # Get business name from title
                    title = result.select_one('h2')
                    if title:
                        name = title.get_text().strip()
                        # Clean up name
                        name = re.sub(r'\s*[-|].*$', '', name).strip()
                        if name and len(name) < 100:
                            found.append({
                                "name": name, "phone": phone, "city": city,
                                "state": state, "trade": trade, "source": "bing"
                            })
                            if len(found) >= 5:
                                break
    except:
        pass
    return found

def load_all_cities():
    """Load all US cities."""
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
    """Insert a business into Supabase."""
    try:
        # Check for duplicates
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

def main():
    print("[START] Proxy-Enabled Gap Filler", flush=True)
    
    # Fetch initial proxies
    if not fetch_fresh_proxies():
        print("[WARN] Running without proxies - direct connection", flush=True)
    
    cities = load_all_cities()
    print(f"[INFO] Loaded {len(cities)} cities", flush=True)
    
    stats = {"checked": 0, "filled": 0}
    
    while True:
        for loc in cities:
            city = loc['city']
            state = loc['state']
            
            for trade in TRADES:
                count = get_listing_count(trade, city)
                if count >= 5:
                    continue
                
                needed = 5 - count
                # ASCII-safe print
                try:
                    print(f"[GAP] {city}, {state} [{trade}]: {count}/5", flush=True)
                except:
                    print(f"[GAP] (city), {state} [{trade}]: {count}/5", flush=True)
                
                stats["checked"] += 1
                
                results = search_with_proxy(trade, city, state)
                
                for biz in results[:needed]:
                    if not biz.get('phone') or len(biz['phone']) < 10:
                        continue
                    
                    if insert_business(biz, trade, city, state):
                        try:
                            print(f"  [OK] ADDED: {biz['name']}", flush=True)
                        except:
                            print(f"  [OK] ADDED: (business)", flush=True)
                        stats["filled"] += 1
                
                # Small delay between searches
                time.sleep(random.uniform(0.3, 0.8))
        
        print(f"\n[CYCLE] Complete. Added: {stats['filled']}. Restarting...\n", flush=True)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("[STOP] Interrupted")
