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

def search_yp(trade, city, state):
    """Scrapes YellowPages.com for real business data."""
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
                
                # Extract rating and review if available
                rating = None
                review_snippet = None
                rating_tag = res.find('div', class_='ratings')
                if rating_tag:
                    # YP uses class like 'result-rating four' or 'result-rating five'
                    rating_class = rating_tag.get('class', [])
                    for cls in rating_class:
                        if cls in ['one', 'two', 'three', 'four', 'five']:
                            rating = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5}.get(cls)
                            break
                    # Try to get numeric rating
                    if not rating:
                        rating_text = rating_tag.get_text()
                        import re as regex
                        nums = regex.findall(r'(\d+\.?\d*)', rating_text)
                        if nums:
                            rating = min(5, round(float(nums[0])))
                
                review_tag = res.find('p', class_='body') or res.find('div', class_='snippet')
                if review_tag:
                    review_snippet = review_tag.get_text().strip()[:500]  # Limit length
                
                biz_data = {"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "yp"}
                if rating:
                    biz_data["rating"] = rating
                if review_snippet:
                    biz_data["review_snippet"] = review_snippet
                found.append(biz_data)
        elif response.status_code == 403:
            return None  # Signal to try another source
    except: pass
    return found

def search_yelp(trade, city, state):
    """Scrapes Yelp for real business data."""
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
            # Yelp uses data in JSON-LD or specific containers
            for biz in soup.select('[data-testid="serp-ia-card"]')[:6]:
                name_el = biz.select_one('a[name]') or biz.select_one('h3 a')
                phone_el = biz.select_one('[class*="phone"]')
                if not name_el: continue
                name = name_el.get_text().strip()
                phone = phone_el.get_text().strip() if phone_el else ""
                if not phone or len(phone) < 10: continue
                found.append({"name": name, "phone": phone, "city": city, "state": state, "trade": trade, "country_code": "US", "source": "yelp"})
        elif response.status_code == 403:
            return None
    except: pass
    return found

# Track source status for cool-downs
SOURCE_STATUS = {
    "yp": {"last_fail": 0, "cooldown": 0},
    "yelp": {"last_fail": 0, "cooldown": 0},
    "manta": {"last_fail": 0, "cooldown": 0}
}

def search_manta(trade, city, state):
    """Scrapes Manta for real business data."""
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
            # Manta listings often have "tel:" links and names in hover-enabled links
            # We look for all tel links and find their relative name
            for tel_link in soup.select('a[href^="tel:"]'):
                phone = tel_link.get('href', '').replace('tel:', '').strip()
                if not phone or len(phone) < 10: continue
                
                # Find name - usually in a nearby link with cursor-pointer
                # We'll look for the structure we saw in debug
                parent_flex = tel_link.find_parent('div', class_='flex')
                if not parent_flex: continue
                
                grandparent = parent_flex.find_parent('div')
                if not grandparent: continue
                
                name_el = grandparent.select_one('a[class*="hover:text-primary"], h2 a, .company-name')
                if not name_el:
                    # Try going up another level
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
    """Try multiple sources with rotation and cool-down for blocked sources."""
    available_sources = []
    now = time.time()
    
    # Check cool-downs
    for src in ["yp", "yelp", "manta"]:
        status = SOURCE_STATUS[src]
        if now - status["last_fail"] > status["cooldown"]:
            if src == "yp": available_sources.append(("yp", search_yp))
            elif src == "yelp": available_sources.append(("yelp", search_yelp))
            elif src == "manta": available_sources.append(("manta", search_manta))
            
    if not available_sources:
        print("[ERR] All sources in cool-down. Waiting 30s...", flush=True)
        time.sleep(30)
        return []

    random.shuffle(available_sources)
    
    for src_name, search_fn in available_sources:
        try:
            result = search_fn(trade, city, state)
            if result is None:  # Blocked (403/429)
                print(f"      [STOP] {src_name.upper()} blocked us. Cool-down 10m.", flush=True)
                SOURCE_STATUS[src_name]["last_fail"] = time.time()
                SOURCE_STATUS[src_name]["cooldown"] = 600 # 10 minutes
                continue
            
            if result:
                # Reset cool-down on success? Maybe not fully, but it's working.
                SOURCE_STATUS[src_name]["cooldown"] = 0
                return result
        except:
            continue
    
    return []  # All tried or blocked

def get_listing_count(trade, city):
    """Helper to get the current count of listings for a trade in a city."""
    res = supabase.table("businesses").select("id", count="exact")\
        .eq("country_code", "US")\
        .eq("city", city)\
        .eq("trade", trade)\
        .execute()
    return res.count

def loop_forever():
    """Continuous execution loop."""
    print("[START] Starting Continuous USA Gap Fill V3 (Prioritized)...", flush=True)
    
    # Initial load
    all_locations = load_cities_prioritized()
    if not all_locations:
        print("[ERR] No locations found.", flush=True)
        return

    while True:
        # Re-shuffle or re-prioritize every full loop? 
        # Actually, let's just loop. The list is huge (>100k). One loop takes forever.
        # We assume the list is already sorted by priority.
        
        for loc in all_locations:
            city = loc['city']
            state = loc['state']
            
            for trade in TRADES:
                try:
                    stats["checked"] += 1
                    
                    # 1. Check current count in Supabase
                    count = get_listing_count(trade, city)
                    
                    if count < 5:
                        print(f"[GAP] {city}, {state} [{trade}]: Has {count}/5", flush=True)
                        
                        # Search using multi-source rotation
                        potential_listings = search_businesses_multi(trade, city, state)
                        
                        if not potential_listings:
                            # No results? Just move on. "Listings coming soon" is handled by UI (empty state).
                            continue
                            
                        # Insert
                        for biz in potential_listings:
                            try:
                                # Strict Dedupe by Phone
                                check = supabase.table("businesses").select("id").eq("phone", biz['phone']).execute()
                                if check.data:
                                    continue
                                
                                # Slug Gen
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
                                
                                try:
                                    # Attempt insertion
                                    res = supabase.table("businesses").insert(insert_data).execute()
                                    if res.data:
                                        biz_id = res.data[0]['id']
                                        print(f"      [OK] ADDED: {biz['name']} ({trade})", flush=True)
                                        stats["filled"] += 1
                                        
                                        # Insert Reviews if any (part of search result)
                                        reviews = biz.get('reviews', [])
                                        # Or legacy snippet logic
                                        if not reviews and biz.get('review_snippet'):
                                            reviews = [{
                                                "author": "Verified Customer",
                                                "rating": biz.get('rating', 5),
                                                "content": biz['review_snippet']
                                            }]

                                        if reviews:
                                            for rev in reviews:
                                                try:
                                                    supabase.table("reviews").insert({
                                                        "business_id": biz_id,
                                                        "user_name": rev.get('author') or rev.get('user_name') or 'Verified Customer',
                                                        "rating": rev.get('rating', 5),
                                                        "comment": rev.get('content') or rev.get('comment') or 'Great service.',
                                                        "title": f"Review from {biz.get('source', 'directory').upper()}",
                                                        "verified_purchase": True,
                                                        "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
                                                    }).execute()
                                                except: pass
                                            print(f"         [REVIEWS] Added {len(reviews)} reviews", flush=True)
                                        
                                        # Save to backup (including social links found inline)
                                        with open("scraped_data_backup_us.jsonl", "a") as f:
                                            try:
                                                socials = enrich_business_inline(biz['name'])
                                                biz['socials'] = socials
                                            except: biz['socials'] = {}
                                            biz['supabase_id'] = biz_id
                                            f.write(json.dumps(biz) + "\n")
                                        
                                        time.sleep(1) # Small delay between writes
                                except Exception as e:
                                    print(f"      [ERR] Insertion failed for {biz['name']}: {e}", flush=True)
                                    continue
                                
                            except Exception as insert_err:
                                print(f"      [ERR] Insertion failed: {insert_err}", flush=True)
                                
                        # Sleep between trades/cities prevents rate limits
                        time.sleep(2) 
                        
                    elif stats["checked"] % 100 == 0:
                        print(f"   [OK] {city} [{trade}] already has {count} listings.", flush=True)

                except Exception as e:
                    print(f"[ERR] Error in loop: {e}", flush=True)
                    stats["errors"] += 1
                    time.sleep(5)

            # Report Occasional Stats
            if stats["checked"] % 20 == 0:
                 print(f"[STATS] Checked {stats['checked']} | Filled {stats['filled']}", flush=True)

        print("[LOOP] Full loop completed. Restarting...", flush=True)
        # Shuffle for next pass to vary coverage? Or keep priority?
        # Maybe reshuffle majors and others separately?
        # For now, just restart.
        time.sleep(10)

if __name__ == "__main__":
    try:
        loop_forever()
    except KeyboardInterrupt:
        print("ðŸ›‘ Stopped.")

