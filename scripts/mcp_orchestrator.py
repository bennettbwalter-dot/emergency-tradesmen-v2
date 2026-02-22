#!/usr/bin/env python3
"""
MCP ORCHESTRATION LAYER - SAFETY-FIRST EDITION
----------------------------------------------
Aggregates Yelp, Foursquare, and HERE APIs with persistent safety limits.
Ensures zero-cost by never exceeding free tiers.
Supports parallel workers and on-the-fly rich data enrichment.
"""
import os
import json
import time
import random
import re
import uuid
import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup

from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

# =============================================================================
# SAFETY LIMITS
# =============================================================================
SAFETY_LIMITS = {
    "yelp": {"daily": 4950},          # Free tier: 5,000/day
    "foursquare": {"monthly": 99000}, # Free tier: 100,000/month
    "here": {"monthly": 29142}        # Hard cap: User has 19142 used, wants exactly 10k budget total (19142 + 10000 = 29142)
}

STATS_FILE = os.path.join(os.path.dirname(__file__), 'usage_stats.json')

# =============================================================================
# DATA CLASSES & HELPERS
# =============================================================================

class APISource:
    def __init__(self, name: str, api_key: str):
        self.name = name
        self.api_key = api_key
        self.cooldown_until = datetime.min
        self.is_dead = False
    
    def is_available(self, current_stats: Dict) -> bool:
        if self.is_dead: 
            print(f"      [DEBUG] {self.name}: DEAD")
            return False
        if datetime.now() < self.cooldown_until: 
            print(f"      [DEBUG] {self.name}: COOLDOWN until {self.cooldown_until}")
            return False
        
        limits = SAFETY_LIMITS.get(self.name, {})
        stats = current_stats.get(self.name, {})
        
        if "daily" in limits and stats.get("daily_calls", 0) >= limits["daily"]:
            print(f"      [DEBUG] {self.name}: DAILY LIMIT ({stats.get('daily_calls', 0)}/{limits['daily']})")
            return False
        if "monthly" in limits and stats.get("monthly_calls", 0) >= limits["monthly"]:
            print(f"      [DEBUG] {self.name}: MONTHLY LIMIT ({stats.get('monthly_calls', 0)}/{limits['monthly']})")
            return False
                
        return True

class RichDataScraper:
    """Scrapes websites for emails and social links."""
    SOCIAL_DOMAINS = {
        'facebook': 'facebook.com',
        'instagram': 'instagram.com',
        'linkedin': 'linkedin.com',
        'twitter': ['twitter.com', 'x.com'],
        'tiktok': 'tiktok.com'
    }

    @staticmethod
    def scrape(url: str) -> Dict:
        if not url: return {}
        if not url.startswith('http'): url = 'https://' + url
        
        headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        try:
            resp = requests.get(url, headers=headers, timeout=8)
            if resp.status_code != 200: return {}
            
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text()
            
            found = {
                'email': None,
                'social_links': {}
            }
            
            # Email pattern
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            if email_match:
                # Filter out obvious trash
                email = email_match.group(0).lower()
                if not any(x in email for x in ['example.com', 'sentry.io', 'wixpress.com']):
                    found['email'] = email
            
            # Social links
            for link in soup.find_all('a', href=True):
                href = link['href'].strip().lower()
                if not href: continue
                
                try:
                    # Logic to catch "instagram.com/user" without http
                    is_social = False
                    target_platform = None
                    for platform, domain in RichDataScraper.SOCIAL_DOMAINS.items():
                        domains = [domain] if isinstance(domain, str) else domain
                        if any(d in href for d in domains):
                            is_social = True
                            target_platform = platform
                            break
                    
                    if is_social:
                        # If it's a social link, don't let urljoin make it relative to the business site
                        # unless it actually IS a relative path (unlikely for social domains but possible)
                        # Actually, if it contains the domain, it should be absolute.
                        if not href.startswith('http') and not href.startswith('//'):
                            full_url = 'https://' + href
                        else:
                            full_url = urljoin(url, href)
                    else:
                        full_url = urljoin(url, href)
                    
                    full_url = full_url.lower()
                    if target_platform:
                        if 'share' not in full_url and 'sharer' not in full_url:
                            found['social_links'][target_platform] = full_url
                except: continue
                
            return found
        except: return {}

# =============================================================================
# API WRAPPERS
# =============================================================================

class YelpAPI:
    @staticmethod
    def search(api_key: str, trade: str, city: str, state: str) -> List[Dict]:
        url = "https://api.yelp.com/v3/businesses/search"
        headers = {"Authorization": f"Bearer {api_key}"}
        params = {
            "term": trade.replace("-", " "),
            "location": f"{city}, {state}",
            "limit": 10
        }
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.status_code == 200:
                found = []
                for b in resp.json().get("businesses", []):
                    phone = re.sub(r'[^\d]', '', b.get("phone", ""))
                    if len(phone) == 11 and phone.startswith('1'): phone = phone[1:]
                    if len(phone) == 10:
                        found.append({
                            "name": b['name'], 
                            "phone": phone, 
                            "source": "yelp", 
                            "rating": b.get("rating"),
                            "review_count": b.get("review_count"),
                            "website": b.get("url") # Yelp landing page as fallback
                        })
                return found
            elif resp.status_code == 429: return "RATE_LIMIT"
            elif resp.status_code in [401, 403]: return "AUTH_ERROR"
            return []
        except: return "ERROR"


class HereAPI:
    @staticmethod
    def search(api_key: str, trade: str, city: str, state: str) -> List[Dict]:
        url = "https://discover.search.hereapi.com/v1/discover"
        params = {
            "q": f"{trade.replace('-', ' ')} in {city} {state}",
            "apiKey": api_key,
            "limit": 10
        }
        try:
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                found = []
                for item in resp.json().get("items", []):
                    contacts = item.get("contacts", [])
                    raw_phone = ""
                    if contacts and "phone" in contacts[0] and contacts[0]["phone"]:
                        raw_phone = contacts[0]["phone"][0].get("value", "")
                    
                    phone = re.sub(r'[^\d]', '', raw_phone)
                    if len(phone) == 11 and phone.startswith('1'): phone = phone[1:]
                    
                    if len(phone) == 10:
                        address = ""
                        if item.get("address") and item["address"].get("street"):
                            address = item["address"]["street"]
                        else:
                            address = f"{city}, {state}"
                            
                        website = None
                        if contacts and "www" in contacts[0] and contacts[0]["www"]:
                            website = contacts[0]["www"][0].get("value")
                            
                        found.append({
                            "name": item.get("title", ""),
                            "phone": phone,
                            "source": "here",
                            "address": address,
                            "website": website
                        })
                return found
            elif resp.status_code == 429: return "RATE_LIMIT"
            elif resp.status_code in [401, 403]: return "AUTH_ERROR"
            return []
        except: return "ERROR"


class WebSearchAPI:
    """Fallback directory scraper for YellowPages.com to ensure continuous building."""
    @staticmethod
    def search(trade: str, city: str, state: str) -> List[Dict]:
        trade_query = trade.replace("-", " ")
        location_query = f"{city}, {state}"
        url = f"https://www.yellowpages.com/search?search_terms={trade_query}&geo_location_terms={location_query}"
        
        headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        try:
            resp = requests.get(url, headers=headers, timeout=15)
            if resp.status_code != 200: return []
            
            soup = BeautifulSoup(resp.text, 'html.parser')
            found = []
            
            # YellowPages result cards
            for card in soup.select('.result'):
                name_tag = card.select_one('.business-name')
                phone_tag = card.select_one('.phones')
                addr_tag = card.select_one('.adr')
                
                if name_tag and phone_tag:
                    name = name_tag.get_text(strip=True)
                    phone = re.sub(r'[^\d]', '', phone_tag.get_text(strip=True))
                    if len(phone) == 11 and phone.startswith('1'): phone = phone[1:]
                    
                    if len(phone) == 10:
                        found.append({
                            "name": name,
                            "phone": phone,
                            "source": "web_fallback",
                            "address": addr_tag.get_text(strip=True) if addr_tag else f"{city}, {state}",
                            "website": "https://www.yellowpages.com" + name_tag['href'] if name_tag.has_attr('href') else None
                        })
                if len(found) >= 10: break
            
            if found:
                print(f"    [WEB] Found {len(found)} results from YellowPages")
            return found
        except: return []

# =============================================================================
# ORCHESTRATOR
# =============================================================================

class MCPOrchestrator:
    def __init__(self):
        self.stats = self._load_stats()
        self.sources = {}
        self._init_sources()
        
        # Supabase
        url = os.getenv("VITE_SUPABASE_URL") or os.environ.get("\ufeffVITE_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        self.sb = create_client(url, key)
        
        self.cities = self._load_cities()
        self.found_added = 0
        self.lock = threading.Lock()

    def _init_sources(self):
        if os.getenv("YELP_API_KEY"):
            self.sources["yelp"] = APISource("yelp", os.getenv("YELP_API_KEY"))
        if os.getenv("FOURSQUARE_API_KEY"):
            self.sources["foursquare"] = APISource("foursquare", os.getenv("FOURSQUARE_API_KEY"))
        if os.getenv("HERE_API_KEY"):
            self.sources["here"] = APISource("here", os.getenv("HERE_API_KEY"))
        print(f"[INIT] Active Sources: {list(self.sources.keys())}")

    def _load_stats(self) -> Dict:
        if os.path.exists(STATS_FILE):
            try:
                with open(STATS_FILE, 'r') as f:
                    stats = json.load(f)
                now = datetime.now()
                today_str = now.strftime('%Y-%m-%d')
                month_str = now.strftime('%Y-%m')
                
                if stats["yelp"]["last_reset"] != today_str:
                    stats["yelp"]["daily_calls"] = 0
                    stats["yelp"]["last_reset"] = today_str
                    
                for s in ["foursquare", "here"]:
                    if stats.get(s) and stats[s].get("last_reset_month") != month_str:
                        stats[s]["monthly_calls"] = 0
                        stats[s]["last_reset_month"] = month_str
                return stats
            except: pass
        return {"yelp": {"daily_calls": 0, "last_reset": "2026-02-01"}, 
                "foursquare": {"monthly_calls": 0, "last_reset_month": "2026-02"},
                "here": {"monthly_calls": 0, "last_reset_month": "2026-02"}}

    def _load_gaps(self):
        gap_file = os.path.join(os.path.dirname(__file__), 'us_listing_gaps.json')
        if os.path.exists(gap_file):
            with open(gap_file, 'r', encoding='utf-8') as f:
                gaps = json.load(f)
            # PRIORITY RULE: Sort by 'needed' descending to fill the largest gaps first
            return sorted(gaps, key=lambda x: x.get('needed', 0), reverse=True)
        return []

    def _save_stats(self):
        with self.lock:
            with open(STATS_FILE, 'w') as f:
                json.dump(self.stats, f, indent=4)

    def _load_cities(self):
        path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        cities = []
        for s in data['states']:
            sc = s['code']
            for m in s['metros']:
                for c in m['cities']:
                    cities.append({"city": c['name'], "state": sc})
        random.shuffle(cities)
        return cities

    def search(self, trade, city, state) -> List[Dict]:
        available = [s for s in self.sources.values() if s.is_available(self.stats)]
        
        for src in available:
            print(f"  [API] Trying {src.name}...")
            if src.name == "yelp": 
                time.sleep(random.uniform(2.0, 5.0)) # Reduced sleep for acceleration
                res = YelpAPI.search(src.api_key, trade, city, state)
            elif src.name == "foursquare":
                res = FoursquareAPI.search(src.api_key, trade, city, state)
            elif src.name == "here":
                res = HereAPI.search(src.api_key, trade, city, state)
            else: res = []
            
            with self.lock:
                if src.name == "yelp": self.stats["yelp"]["daily_calls"] += 1
                else: self.stats[src.name]["monthly_calls"] += 1
            self._save_stats()

            if isinstance(res, list) and res:
                print(f"    [{src.name}] Found {len(res)} results")
                return res
            
            if res == "RATE_LIMIT":
                src.cooldown_until = datetime.now() + timedelta(minutes=2)
                print(f"      [RATE] {src.name} rate-limited, cooling for 2 mins...")
            if res == "AUTH_ERROR":
                src.is_dead = True
        
        # FALLBACK: Try Web Search if APIs are exhausted, rate-limited, or return zero results
        print(f"    [WEB] No API results. Falling back to internet search for {city}, {state}...")
        return WebSearchAPI.search(trade, city, state)

    def insert(self, biz, trade, city, state):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Check if phone exists for this trade
                # Check if business already exists by phone + trade
                exists = self.sb.table("businesses").select("id, city, coverage_areas").eq("phone", biz['phone']).eq("trade", trade).execute()
                
                if exists.data:
                    existing_biz = exists.data[0]
                    existing_city = existing_biz.get('city', '')
                    current_coverage = existing_biz.get('coverage_areas') or []
                    
                    # If it's a different city and not already in coverage, update it
                    if city != existing_city and city not in current_coverage:
                        print(f"    [UPDATE] Adding coverage: {city} to {biz['name']}")
                        new_coverage = list(set(current_coverage + [city]))
                        self.sb.table("businesses").update({"coverage_areas": new_coverage}).eq("id", existing_biz['id']).execute()
                        return True # Counts as "added" for the gap filler
                    return False # Already covered
                
                # --- RICH DATA ENRICHMENT ---
                if biz.get('website') and (not biz.get('email') or not biz.get('social_links')):
                    print(f"    [SCRAPE] Visiting {biz['website']}...")
                    scraped = RichDataScraper.scrape(biz['website'])
                    if scraped:
                        if not biz.get('email') and scraped.get('email'):
                            biz['email'] = scraped['email']
                        biz['social_links'] = scraped.get('social_links', {})

                # --- TRUST SCORE CALCULATION (1-5) ---
                score = 1 # Real business (Found from API)
                if biz.get('email'): score += 1
                if biz.get('social_links') and len(biz.get('social_links')) > 0: score += 1
                if biz.get('website'): score += 1
                if biz.get('rating') or biz.get('review_count', 0) > 0: score += 1

                slug = f"{re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')}-{str(uuid.uuid4())[:8]}"
                data = {
                    "id": str(uuid.uuid4()), "name": biz['name'], "slug": slug,
                    "trade": trade, "city": city, "country_code": "US",
                    "phone": biz['phone'], "address": biz.get('address') or f"{city}, {state}",
                    "verified": True, "tier": "standard", "created_at": datetime.now().isoformat(),
                    "website": biz.get('website'),
                    "email": biz.get('email'),
                    "social_links": biz.get('social_links', {}),
                    "rating": biz.get('rating'),
                    "review_count": biz.get('review_count', 0),
                    "trust_score": score
                }
                
                try:
                    self.sb.table("businesses").insert(data).execute()
                except Exception as e:
                    err_str = str(e)
                    if "social_links" in err_str or "trust_score" in err_str or "PGRST204" in err_str:
                        print(f"      [!] Column/Sync Issue: Retrying minimal insert...")
                        data.pop("social_links", None)
                        data.pop("trust_score", None)
                        self.sb.table("businesses").insert(data).execute()
                    else: raise e
                
                return True
            except Exception as e:
                if "10035" in str(e) and attempt < max_retries - 1:
                    wait = (attempt + 1) * 2
                    print(f"      [!] Socket Error (Timeout). Retrying in {wait}s...")
                    time.sleep(wait)
                    continue
                print(f"      [!] Insert Error: {e}")
                return False
        return False

    def process_gap(self, loc, trade):
        # Count businesses where city matches OR city is in coverage_areas
        # Using PostgREST or filtering: city.eq.City OR coverage_areas.cs.{City}
        city_filter = f"city.eq.{loc['city']},coverage_areas.cs.{{{loc['city']}}}"
        res = self.sb.table("businesses").select("id", count="exact").eq("trade", trade).eq("country_code", "US").or_(city_filter).execute()
        
        if (res.count or 0) >= 5: return 0
        
        needed = 5 - (res.count or 0)
        print(f"[GAP] {loc['city']}, {loc['state']} [{trade}] - Need {needed}")
        
        results = self.search(trade, loc['city'], loc['state'])
        if results == "ALL_EXHAUSTED": return "STOP"

        added = 0
        for biz in results:
            if self.insert(biz, trade, loc['city'], loc['state']):
                print(f"  [OK] Added: {biz['name']} ({biz['source']})")
                added += 1
                with self.lock: self.found_added += 1
                if added >= needed: break
        return added

    def run(self, max_workers=5):
        gaps = self._load_gaps()
        if not gaps:
            print("[ERR] No gaps found in us_listing_gaps.json. Run scripts/analyze_us_gaps.js first.")
            return

        print(f"\n[ORCHESTRA] Starting autonomous USA Gap-Fill (11 Trades)...")
        print(f"Total Gaps: {len(gaps)}")
        print(f"Acceleration: {max_workers} agents (Safety Throttled).\n")
        
        while True:
            available = [s for s in self.sources.values() if s.is_available(self.stats)]
            if available:
                print(f"[ACTIVE] API Sources available: {[s.name for s in available]}")
            else:
                print(f"[ACTIVE] API sources exhausted. running in WEB-ONLY mode.")
            
            print(f"[ACTIVE] Sources available: {[s.name for s in available]}")
            
            # Process in batches of 500 to avoid overloading memory/threadpool
            BATCH_SIZE = 500
            for i in range(0, len(gaps), BATCH_SIZE):
                batch = gaps[i : i + BATCH_SIZE]
                print(f"[BATCH] Processing {i} to {i + len(batch)} of {len(gaps)}...")
                
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = []
                    for gap in batch:
                        loc = {"city": gap['city'], "state": gap['stateSlug'].upper()}
                        futures.append(executor.submit(self.process_gap, loc, gap['trade']))
                    
                    for future in as_completed(futures):
                        try:
                            res = future.result()
                            if res == "STOP":
                                executor.shutdown(wait=False, cancel_futures=True)
                                break
                        except: continue
                
                # Check source availability after each batch
                self.stats = self._load_stats()
            
            print("\n[LOOP] Full cycle complete. Refreshing gaps and continuing (web fallback is unlimited)...")
            time.sleep(30)  # Brief pause to prevent CPU thrashing
            gaps = self._load_gaps() # Refresh gaps

if __name__ == "__main__":
    try:
        MCPOrchestrator().run(max_workers=10)
    except KeyboardInterrupt:
        print("\n[END] Stopped by user")
