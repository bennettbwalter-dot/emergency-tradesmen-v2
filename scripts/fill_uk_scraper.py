import os
import json
import time
import re
import random
import requests
import sys
from bs4 import BeautifulSoup
from urllib.parse import quote

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

# --- Configuration ---
GAPS_FILE = os.path.join(os.path.dirname(__file__), 'uk_listing_gaps.json')
QUEUE_FILE = os.path.join(os.path.dirname(__file__), 'verified_listings_queue.json')
LOG_FILE = os.path.join(os.path.dirname(__file__), 'uk_scraper.log')

USER_AGENT_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1"
]

def log(msg):
    timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
    try:
        with open(LOG_FILE, 'a', encoding='utf-8') as f:
            f.write(f"[{timestamp}] {msg}\n")
    except: pass
    print(f"[{timestamp}] {msg}")

TRADE_MAP = {
    "drain-specialist": "drainage",
    "breakdown": "breakdown recovery",
    "glazier": "glass repair",
    "gas-engineer": "heating engineer",
    "locksmith": "locksmith",
    "plumber": "plumber",
    "electrician": "electrician",
    "roofer": "roofing",
    "builder": "builder",
    "hvac": "air conditioning"
}

def get_random_agent():
    return random.choice(USER_AGENT_LIST)

def scrape_scoot(trade, city):
    """Scrapes Scoot.co.uk for business listings (FREE)."""
    search_keyword = TRADE_MAP.get(trade, trade.replace('-', ' '))
    encoded_trade = quote(search_keyword)
    encoded_city = quote(city)
    url = f"https://www.scoot.co.uk/search?what={encoded_trade}&where={encoded_city}"
    
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html',
        'Referer': 'https://www.scoot.co.uk/'
    }
    
    found = []
    try:
        time.sleep(random.uniform(4.0, 8.0))
        resp = requests.get(url, headers=headers, timeout=15)
        
        if resp.status_code in [403, 429]:
            log(f"   ⚠️ Scoot blocked us (Status {resp.status_code}).")
            return None
            
        if resp.status_code != 200: return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Scoot structure: listings in item-content or similar
        items = soup.select('.item') or soup.select('.listing')
        
        for item in items[:8]:
            try:
                name_el = item.select_one('.item-title a') or item.select_one('h2')
                if not name_el: continue
                name = name_el.get_text().strip()
                
                phone_el = item.select_one('.item-phone') or item.select_one('.telephone')
                if not phone_el: continue
                phone = phone_el.get_text().strip()
                
                found.append({
                    "name": name, "trade": trade, "city": city, "phone": phone, "address": city, "country_code": "GB", "source": "scoot"
                })
            except: continue
    except Exception as e:
        log(f"   ❌ Scoot error: {str(e)}")
    return found

def scrape_ddg_fallback(trade, city, site_filter="cylex-uk.co.uk"):
    """Uses DuckDuckGo HTML to find profiles for a specific directory."""
    search_keyword = TRADE_MAP.get(trade, trade.replace('-', ' '))
    query = f"site:{site_filter} {city} {search_keyword} phone number"
    url = f"https://html.duckduckgo.com/html/?q={quote(query)}"
    
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html',
    }
    
    found = []
    try:
        time.sleep(random.uniform(5.0, 10.0))
        resp = requests.get(url, headers=headers, timeout=15)
        
        if resp.status_code != 200:
            log(f"   ⚠️ DDG Blocked or error: {resp.status_code}")
            return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        # DDG HTML results are in .result.results_links_deep
        results = soup.select('.result')
        
        for res in results[:5]:
            try:
                snippet = res.select_one('.result__snippet').get_text()
                # Try to extract phone from snippet - DDG snippets often have it!
                phone_match = re.search(r'(\+?44\s?7\d{3}\s?\d{6}|0\d{2,4}\s?\d{3}\s?\d{3,4})', snippet)
                if not phone_match: continue
                phone = phone_match.group(0).strip()
                
                title = res.select_one('.result__a').get_text().strip()
                # Clean title: usually "Name | Cylex UK"
                name = title.split('|')[0].split('-')[0].strip()
                
                found.append({
                    "name": name, "trade": trade, "city": city, "phone": phone, "address": city, "country_code": "GB", "source": f"ddg-{site_filter}"
                })
            except: continue
    except Exception as e:
        log(f"   ❌ DDG Fallback error: {str(e)}")
    return found

def scrape_cylex(trade, city):
    """Scrapes Cylex-UK.co.uk for business listings (FREE)."""
    search_keyword = TRADE_MAP.get(trade, trade.replace('-', ' '))
    encoded_trade = quote(search_keyword)
    encoded_city = quote(city)
    url = f"https://www.cylex-uk.co.uk/s?q={encoded_trade}&l={encoded_city}"
    
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
    
    found = []
    try:
        time.sleep(random.uniform(4.0, 8.0))
        resp = requests.get(url, headers=headers, timeout=15)
        
        if resp.status_code in [403, 429]:
            log(f"   ⚠️ Cylex blocked us (Status {resp.status_code}).")
            # Try DDG Fallback immediately
            log("   ℹ️ Attempting DDG Fallback for Cylex...")
            return scrape_ddg_fallback(trade, city, "cylex-uk.co.uk")
            
        if resp.status_code != 200: return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        # Better Cylex selectors
        items = soup.select('.search-results-item') or soup.find_all('article')
        
        for item in items[:8]:
            try:
                name_el = item.select_one('h2 a') or item.select_one('.company-name') or item.select_one('h3 a')
                if not name_el: continue
                name = name_el.get_text().strip()
                
                phone_el = item.select_one('.phone') or item.select_one('.telephone') or item.select_one('[itemprop="telephone"]')
                if not phone_el: continue
                phone = phone_el.get_text().strip()
                
                found.append({
                    "name": name, "trade": trade, "city": city, "phone": phone, "address": city, "country_code": "GB", "source": "cylex"
                })
            except: continue
    except Exception as e:
        log(f"   ❌ Cylex error: {str(e)}")
    return found

def scrape_freeindex(trade, city):

    """Scrapes FreeIndex.co.uk for business listings (FREE)."""
    search_keyword = TRADE_MAP.get(trade, trade.replace('-', ' '))
    encoded_trade = quote(search_keyword)
    city_slug = city.lower().replace(' ', '-')
    url = f"https://www.freeindex.co.uk/search.htm?k={encoded_trade}&l={city_slug}"
    
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html',
        'Referer': 'https://www.freeindex.co.uk/'
    }
    
    found = []
    try:
        time.sleep(random.uniform(4.0, 8.0))
        resp = requests.get(url, headers=headers, timeout=15)
        
        if resp.status_code in [403, 429]:
            log(f"   ⚠️ FreeIndex blocked us (Status {resp.status_code}).")
            return None
            
        if resp.status_code != 200: return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        # FreeIndex structure: .business_listing
        listings = soup.select('.business_listing') or soup.select('.listing')
        
        for item in listings[:8]:
            try:
                name_el = item.select_one('.listing_title a') or item.select_one('h2')
                if not name_el: continue
                name = name_el.get_text().strip()
                
                phone_el = item.select_one('.phone_number') or item.select_one('.tel')
                if not phone_el: continue
                phone = phone_el.get_text().strip()
                
                found.append({
                    "name": name, "trade": trade, "city": city, "phone": phone, "address": city, "country_code": "GB", "source": "freeindex"
                })
            except: continue
    except Exception as e:
        log(f"   ❌ FreeIndex error: {str(e)}")
    return found

def scrape_thomson(trade, city):
    """Scrapes ThomsonLocal.com for business listings (FREE)."""
    search_keyword = TRADE_MAP.get(trade, trade.replace('-', ' '))
    encoded_trade = quote(search_keyword)
    encoded_city = quote(city)
    url = f"https://www.thomsonlocal.com/search?keywords={encoded_trade}&location={encoded_city}"
    
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-GB,en;q=0.9',
    }
    
    found = []
    try:
        # Adaptive delay
        time.sleep(random.uniform(3.0, 7.0))
        resp = requests.get(url, headers=headers, timeout=15)
        
        if resp.status_code == 403 or resp.status_code == 429:
            log(f"   ⚠️ Thomson blocked us (Status {resp.status_code}).")
            return None # Signal block
            
        if resp.status_code != 200:
            return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        listings = soup.select('.listing-card') or soup.find_all('div', class_=re.compile('ListingCard'))
        
        for item in listings[:10]:
            try:
                name_el = item.select_one('.listing-name') or item.find('h2')
                if not name_el: continue
                name = name_el.get_text().strip()
                
                phone_el = item.select_one('.listing-tel') or item.find('a', href=re.compile('tel:'))
                if not phone_el: continue
                phone = phone_el.get_text().strip()
                
                address_el = item.select_one('.listing-address') or item.select_one('.address')
                address = address_el.get_text().strip() if address_el else city
                
                found.append({
                    "name": name, "trade": trade, "city": city, "phone": phone, "address": address, "country_code": "GB", "source": "thomson"
                })
            except: continue
    except Exception as e:
        log(f"   ❌ Thomson error: {str(e)}")
    return found

# [DISABLED] Yell is heavily blocked
# def scrape_yell(trade, city):
#     ...


def main():
    if "--test" in sys.argv:
        log("🧪 Running UK Scraper Connectivity Test...")
        for name, fn in [("Scoot", scrape_scoot), ("FreeIndex", scrape_freeindex), ("Cylex", scrape_cylex), ("Thomson", scrape_thomson)]:
             res = fn("plumber", "London")
             if res is not None: log(f"✅ {name} Connectivity OK (Found {len(res)})")
             else: log(f"❌ {name} Blocked")
             time.sleep(2)
        return

    log("🚀 Starting Free UK Scraper (Scoot + FreeIndex + Cylex + Thomson)...")
    if not os.path.exists(GAPS_FILE):
        log(f"❌ Gaps file not found: {GAPS_FILE}")
        return
    with open(GAPS_FILE, 'r') as f:
        gaps = json.load(f)
    log(f"📊 Found {len(gaps)} gaps to fill.")
    random.shuffle(gaps)
    
    for gap in gaps:
        city, trade, needed = gap['city'], gap['trade'], gap['needed']
        log(f"🔍 Checking gap: {city} | {trade} (Needs {needed})")
        
        # Priority 1: Scoot
        results = scrape_scoot(trade, city)
        
        # Priority 2: FreeIndex
        if not results:
            log(f"   ℹ️ Scoot empty/failed, trying FreeIndex...")
            results = scrape_freeindex(trade, city)
            
        # Priority 3: Cylex (now has DDG fallback inside)
        if not results:
             log(f"   ℹ️ FreeIndex empty/failed, trying Cylex...")
             results = scrape_cylex(trade, city)

        # Priority 4: Thomson fallback
        if not results:
             log(f"   ℹ️ Cylex empty/failed, trying Thomson...")
             results = scrape_thomson(trade, city)

        if not results:
            log(f"   ⚠️ No free results found for {city}/{trade}.")
            time.sleep(random.uniform(10, 20))
            continue
            
        to_add = results[:needed]
        try:
            if os.path.exists(QUEUE_FILE):
                with open(QUEUE_FILE, 'r', encoding='utf-8') as f: queue = json.load(f)
            else: queue = []
        except: queue = []
        
        existing_phones = {item.get('phone') for item in queue}
        unique_to_add = [res for res in to_add if res['phone'] not in existing_phones]
        
        if not unique_to_add:
            log(f"   ℹ️ Results found but already in queue.")
            continue
            
        queue.extend(unique_to_add)
        with open(QUEUE_FILE, 'w', encoding='utf-8') as f: json.dump(queue, f, indent=4)
        log(f"   ✅ Queued {len(unique_to_add)} listings for {city}/{trade} from {results[0].get('source')}.")
        
        # Slow down to avoid blocks
        time.sleep(random.uniform(20, 40))


if __name__ == "__main__":
    main()


