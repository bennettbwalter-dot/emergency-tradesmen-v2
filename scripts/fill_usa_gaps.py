import os
import json
import time
import random
import re
import uuid
import sys

# Fix Windows console encoding - use environment variable approach
os.environ['PYTHONIOENCODING'] = 'utf-8'
import cloudscraper
import requests
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
import concurrent.futures

# --- Configuration ---
# Load .env
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
if not SUPABASE_URL:
     SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL") # Handle BOM

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("âŒ Error: Missing Supabase credentials.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Stats
stats = {"checked": 0, "filled": 0, "errors": 0}

# Trades (from src/lib/trades.ts) - ALL 11 TRADES
TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
]

def load_cities_prioritized():
    """Parses src/lib/us_cities.json and returns a prioritized list."""
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"âŒ Error loading us_cities.json: {e}")
        return []

    major_hubs = []
    other_cities = []
    
    seen = set()

    if 'states' in data:
        for state in data['states']:
            state_code = state.get('code')
            if 'metros' in state:
                for metro in state['metros']:
                    metro_name = metro.get('name')
                    anchor = metro.get('anchor_city')
                    
                    if 'cities' in metro:
                        for city in metro['cities']:
                            city_name = city.get('name')
                            if not city_name: continue
                            
                            key = f"{city_name}|{state_code}"
                            if key in seen: continue
                            seen.add(key)
                            
                            item = {"city": city_name, "state": state_code, "metro": metro_name}
                            
                            # Prioritize anchor cities or cities matching metro name
                            if anchor and city_name == anchor:
                                major_hubs.append(item)
                            elif metro_name and city_name in metro_name:
                                major_hubs.append(item)
                            else:
                                other_cities.append(item)
                                
                            # Suburbs
                            if 'suburbs' in city:
                                for sub in city['suburbs']:
                                    sub_name = sub.get('name')
                                    if sub_name:
                                        s_key = f"{sub_name}|{state_code}"
                                        if s_key not in seen:
                                            seen.add(s_key)
                                            other_cities.append({"city": sub_name, "state": state_code, "metro": metro_name})

    print(f"[OK] Loaded {len(major_hubs)} Major Hubs and {len(other_cities)} Other Locations.", flush=True)
    
    # Shuffle independently to randomize within tiers
    random.shuffle(major_hubs)
    random.shuffle(other_cities)
    
    # Return combined list
    return major_hubs + other_cities

# ============ INLINE ENRICHMENT FUNCTIONS ============
def clean_name_for_url(name):
    """Converts 'Smith & Sons Plumbing LLC' to 'smithsonsplumbing'"""
    name = name.lower()
    name = re.sub(r'\b(llc|inc|corp|corporation|co|company)\b', '', name)
    name = name.replace('&', 'and')
    name = re.sub(r'[^a-z0-9]', '', name)
    return name.strip()

def clean_name_hyphenated(name):
    """For LinkedIn: 'smith-sons-plumbing'"""
    name = name.lower()
    name = re.sub(r'\b(llc|inc|corp|corporation|co|company)\b', '', name)
    name = name.replace('&', 'and')
    name = re.sub(r'[^a-z0-9]+', '-', name)
    name = re.sub(r'-+', '-', name).strip('-')
    return name

def check_url_exists_fast(url):
    """Quick HEAD request to check if a social URL exists."""
    try:
        resp = requests.head(url, timeout=3, allow_redirects=True, headers={'User-Agent': 'Mozilla/5.0'})
        return resp.status_code == 200
    except:
        return False

def enrich_business_inline(name):
    """Quickly check for social media presence. Returns dict of found URLs."""
    clean_name = clean_name_for_url(name)
    hyphen_name = clean_name_hyphenated(name)
    
    if not clean_name or len(clean_name) < 3:
        return {}
    
    socials = {}
    
    # Check Facebook (most common)
    fb_url = f"https://www.facebook.com/{clean_name}"
    if check_url_exists_fast(fb_url):
        socials['facebook'] = fb_url
    
    # Check Instagram
    ig_url = f"https://www.instagram.com/{clean_name}"
    if check_url_exists_fast(ig_url):
        socials['instagram'] = ig_url
    
    # Check LinkedIn
    li_url = f"https://www.linkedin.com/company/{hyphen_name}"
    if check_url_exists_fast(li_url):
        socials['linkedin'] = li_url
    
    return socials
# ============ END ENRICHMENT FUNCTIONS ============

def search_dexknows(trade, city, state):
    """Scrapes Dexknows.com for business listings (FREE)."""
    terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain cleaning",
        "breakdown": "towing", "glazier": "glass repair",
        "water-restoration": "water damage restoration", "builder": "general contractor"
    }
    term = terms.get(trade, trade)
    url = f"https://www.dexknows.com/search?search_terms={term}&geo_location_terms={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        time.sleep(random.uniform(4.0, 8.0))
        response = scraper.get(url, timeout=15)
        
        if response.status_code in [403, 429]:
            print(f"      [WARN] Dexknows blocked us.")
            return None
            
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            for res in soup.find_all('div', class_='result')[:8]:
                try:
                    name_tag = res.find('a', class_='business-name') or res.find('h2')
                    phone_tag = res.find('div', class_='phones') or res.find('a', href=re.compile('tel:'))
                    if not name_tag or not phone_tag: continue
                    found.append({
                        "name": name_tag.get_text().strip(), "phone": phone_tag.get_text().strip(),
                        "city": city, "state": state, "trade": trade, "country_code": "US", "source": "dexknows"
                    })
                except: continue
    except: pass
    return found

def search_ddg_fallback(trade, city, state, site_filter=None):
    """Uses DuckDuckGo HTML to find local business data."""
    query = f"{trade} {city} {state} phone number"
    if site_filter: query = f"site:{site_filter} {query}"
    url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    found = []
    try:
        time.sleep(random.uniform(5.0, 10.0))
        resp = requests.get(url, headers=headers, timeout=15)
        if resp.status_code != 200: return []
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        results = soup.select('.result')
        for res in results[:5]:
            try:
                snippet = res.select_one('.result__snippet').get_text()
                # US Phone pattern: (123) 456-7890 or 123-456-7890
                phone_match = re.search(r'(\+?1?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})', snippet)
                if not phone_match: continue
                
                title = res.select_one('.result__a').get_text().strip()
                name = title.split('|')[0].split('-')[0].strip()
                if any(x in name.lower() for x in ['search', 'directory', 'best', 'top']): continue
                
                found.append({
                    "name": name, "phone": phone_match.group(0).strip(),
                    "city": city, "state": state, "trade": trade, "country_code": "US", "source": "ddg-fallback"
                })
            except: continue
    except: pass
    return found

def search_superpages(trade, city, state):
    """Scrapes Superpages.com for business listings (FREE)."""
    terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain cleaning",
        "breakdown": "towing", "glazier": "glass repair",
        "water-restoration": "water damage restoration", "builder": "general contractor"
    }
    term = terms.get(trade, trade)
    url = f"https://www.superpages.com/search?search_terms={term}&geo_location_terms={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        time.sleep(random.uniform(4.0, 8.0))
        response = scraper.get(url, timeout=15)
        
        if response.status_code in [403, 429]:
            print(f"      [WARN] Superpages blocked us. Trying DDG fallback...")
            return search_ddg_fallback(trade, city, state, "superpages.com")
            
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Superpages structure: listings in .result or article
            for res in soup.find_all('div', class_='result')[:8]:
                try:
                    name_tag = res.find('a', class_='business-name') or res.find('h2')
                    phone_tag = res.find('div', class_='phones') or res.find('a', href=re.compile('tel:'))
                    if not name_tag or not phone_tag: continue
                    
                    name = name_tag.get_text().strip()
                    phone = phone_tag.get_text().strip()
                    
                    found.append({
                        "name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "superpages"
                    })
                except: continue
    except: pass
    return found

def search_manta(trade, city, state):
    """Scrapes Manta for real business data."""
    manta_terms = {
        "gas-engineer": "hvac", "drain-specialist": "drain-cleaning",
        "breakdown": "towing-service", "glazier": "glass-repair",
        "water-restoration": "water-damage-restoration", "builder": "general-contractors"
    }
    term = manta_terms.get(trade, trade.replace(' ', '-'))
    url = f"https://www.manta.com/search?search={term}&search_location={city}%2C+{state}"
    
    found = []
    try:
        scraper = cloudscraper.create_scraper()
        time.sleep(random.uniform(4.0, 8.0))
        response = scraper.get(url, timeout=15)
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            # Manta listings often have "tel:" links
            for tel_link in soup.select('a[href^="tel:"]'):
                phone = tel_link.get('href', '').replace('tel:', '').strip()
                if not phone or len(phone) < 10: continue
                
                # Robust name finding
                parent = tel_link.find_parent('div')
                name = None
                while parent and not name:
                    name_el = parent.select_one('a[class*="hover:text-primary"], h2 a, .company-name, h3')
                    if name_el:
                        name = name_el.get_text().strip()
                    parent = parent.parent
                
                if not name or any(x in name.lower() for x in ['search', 'manta', 'login']): continue
                
                found.append({"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "manta"})
                if len(found) >= 6: break
        elif response.status_code in [403, 429]:
            return None
    except: pass
    return found

# [DISABLED] YP/Yelp are heavily blocked
# def search_yp(trade, city, state):
#     ...
# def search_yelp(trade, city, state):
#     ...


# Track source status for cool-downs
SOURCE_STATUS = {
    "superpages": {"last_fail": 0, "cooldown": 0},
    "dexknows": {"last_fail": 0, "cooldown": 0},
    "manta": {"last_fail": 0, "cooldown": 0}
}

def search_businesses_multi(trade, city, state):
    """Try multiple sources with rotation and cool-down for blocked sources."""
    available_sources = []
    now = time.time()
    
    # Check cool-downs with some jitter
    for src in ["superpages", "dexknows", "manta"]:
        status = SOURCE_STATUS[src]
        if now - status["last_fail"] > status["cooldown"]:
            if src == "superpages": available_sources.append(("superpages", search_superpages))
            elif src == "dexknows": available_sources.append(("dexknows", search_dexknows))
            elif src == "manta": available_sources.append(("manta", search_manta))
            
    if not available_sources:
        print("[ERR] All direct sources in cool-down. Trying DDG general fallback...", flush=True)
        return search_ddg_fallback(trade, city, state)

    random.shuffle(available_sources)
    
    for src_name, search_fn in available_sources:
        try:
            result = search_fn(trade, city, state)
            
            if result is None:  # Blocked (403/429)
                cooldown_secs = random.randint(900, 1800) # 15-30 mins
                print(f"      [STOP] {src_name.upper()} blocked us. Cool-down {cooldown_secs//60}m.", flush=True)
                SOURCE_STATUS[src_name]["last_fail"] = time.time()
                SOURCE_STATUS[src_name]["cooldown"] = cooldown_secs
                continue
            
            if result:
                SOURCE_STATUS[src_name]["cooldown"] = 0
                return result
                
            time.sleep(random.uniform(5, 10))
        except Exception as e:
            print(f"      [WARN] {src_name.upper()} error: {e}", flush=True)
            continue
    
    # If all direct sources failed/empty, final DDG fallback
    return search_ddg_fallback(trade, city, state)

def get_listing_count(trade, city):
    """Helper to get the current count of listings for a trade in a city."""
    try:
        res = supabase.table("businesses").select("id", count="exact")\
            .eq("country_code", "US")\
            .eq("city", city)\
            .eq("trade", trade)\
            .execute()
        return res.count
    except: return 0

def loop_forever():
    """Continuous execution loop."""
    if "--test" in sys.argv:
        print("[TEST] Running USA connectivity verification...", flush=True)
        for name, fn in [("Dexknows", search_dexknows), ("Superpages", search_superpages), ("Manta", search_manta)]:
            res = fn("plumber", "Houston", "TX")
            if res is None: print(f"  [X] {name}: BLOCKED", flush=True)
            elif not res: print(f"  [!] {name}: EMPTY/ERROR", flush=True)
            else: print(f"  [OK] {name}: Found {len(res)} businesses", flush=True)
            time.sleep(5)
        
        print("[TEST] Testing DDG Fallback...", flush=True)
        res = search_ddg_fallback("plumber", "Houston", "TX")
        print(f"  [OK] DDG Fallback: Found {len(res)} businesses", flush=True)
        return

    print("[START] Starting Continuous USA Gap Fill V5 (Zero-Button Edition)...", flush=True)
    
    all_locations = load_cities_prioritized()
    if not all_locations:
        print("[ERR] No locations found.", flush=True)
        return

    while True:
        for loc in all_locations:
            city = loc['city']
            state = loc['state']
            
            for trade in TRADES:
                try:
                    stats["checked"] += 1
                    count = get_listing_count(trade, city)
                    
                    if count < 5:
                        print(f"[GAP] {city}, {state} [{trade}]: Has {count}/5", flush=True)
                        potential_listings = search_businesses_multi(trade, city, state)
                        
                        if not potential_listings:
                            time.sleep(random.uniform(10, 20))
                            continue
                            
                        for biz in potential_listings:
                            try:
                                check = supabase.table("businesses").select("id").eq("phone", biz['phone']).execute()
                                if check.data: continue
                                
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
                                    "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
                                }
                                
                                res = supabase.table("businesses").insert(insert_data).execute()
                                if res.data:
                                    biz_id = res.data[0]['id']
                                    print(f"      [OK] ADDED: {biz['name']} ({trade}) from {biz.get('source')}", flush=True)
                                    stats["filled"] += 1
                                    
                                    reviews = biz.get('reviews', [])
                                    if not reviews and biz.get('review_snippet'):
                                        reviews = [{"author": "Verified Customer", "rating": biz.get('rating', 5), "content": biz['review_snippet']}]

                                    if reviews:
                                        for rev in reviews:
                                            try:
                                                supabase.table("reviews").insert({
                                                    "business_id": biz_id,
                                                    "user_name": rev.get('author') or 'Verified Customer',
                                                    "rating": rev.get('rating', 5),
                                                    "comment": rev.get('content') or 'Great service.',
                                                    "title": f"Review from {biz.get('source', 'directory').upper()}",
                                                    "verified_purchase": True,
                                                    "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
                                                }).execute()
                                            except: pass
                                    
                                    with open("scraped_data_backup_us.jsonl", "a") as f:
                                        try: socials = enrich_business_inline(biz['name'])
                                        except: socials = {}
                                        biz['socials'] = socials
                                        biz['supabase_id'] = biz_id
                                        f.write(json.dumps(biz) + "\n")
                                    
                                    time.sleep(random.uniform(2, 5))
                            except Exception as e:
                                print(f"      [ERR] Insertion failed: {e}", flush=True)
                                continue
                                
                        time.sleep(random.uniform(20, 40)) 
                        
                    elif stats["checked"] % 100 == 0:
                        print(f"   [OK] {city} [{trade}] already has {count} listings.", flush=True)

                except Exception as e:
                    print(f"[ERR] Error in loop: {e}", flush=True)
                    stats["errors"] += 1
                    time.sleep(20)

            if stats["checked"] % 20 == 0:
                 print(f"[STATS] Checked {stats['checked']} | Filled {stats['filled']}", flush=True)

        print("[LOOP] Full loop completed. Restarting...", flush=True)
        time.sleep(60)

if __name__ == "__main__":
    try:
        loop_forever()
    except KeyboardInterrupt:
        print("[STOP] Stopped by user.")


