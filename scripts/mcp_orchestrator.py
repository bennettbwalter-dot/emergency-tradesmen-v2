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
    "foursquare": {"monthly": 9900},  # Free tier: 10,000/month
    "here": {"monthly": 225000}       # Free tier: 250,000/month (90% limit, 10% buffer)
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
                href = link['href']
                try:
                    full_url = urljoin(url, href).lower()
                    for platform, domain in RichDataScraper.SOCIAL_DOMAINS.items():
                        domains = [domain] if isinstance(domain, str) else domain
                        if any(d in full_url for d in domains):
                            if 'share' not in full_url and 'sharer' not in full_url:
                                found['social_links'][platform] = full_url
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
                    
                for s in ["foursquare"]:
                    if stats.get(s) and stats[s].get("last_reset_month") != month_str:
                        stats[s]["monthly_calls"] = 0
                        stats[s]["last_reset_month"] = month_str
                return stats
            except: pass
        return {"yelp": {"daily_calls": 0, "last_reset": "2026-02-01"}, 
                "foursquare": {"monthly_calls": 0, "last_reset_month": "2026-02"}}

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
        if not available: return "ALL_EXHAUSTED"

        for src in available:
            print(f"  [API] Trying {src.name}...")
            if src.name == "yelp": 
                time.sleep(random.uniform(10.0, 15.0)) # Super conservative for Yelp free tier to avoid 429s
                res = YelpAPI.search(src.api_key, trade, city, state)
            
            with self.lock:
                if src.name == "yelp": self.stats["yelp"]["daily_calls"] += 1
                else: self.stats[src.name]["monthly_calls"] += 1
            self._save_stats()

            if res == "RATE_LIMIT":
                src.cooldown_until = datetime.now() + timedelta(minutes=2)
                print(f"      [RATE] {src.name} rate-limited, cooling for 2 mins...")
                continue
            if res == "AUTH_ERROR":
                src.is_dead = True
                continue
            if res == "ERROR": continue

            if isinstance(res, list) and res:
                print(f"    [{src.name}] Found {len(res)} results")
                return res
        return []

    def insert(self, biz, trade, city, state):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Check if phone exists for this trade
                exists = self.sb.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).execute()
                if exists.data: return False
                
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
        res = self.sb.table("businesses").select("id", count="exact").eq("trade", trade).eq("city", loc['city']).eq("country_code", "US").execute()
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

    def run(self, max_workers=1):
        trades = ["plumber", "electrician", "locksmith", "hvac", "roofer", "builder"]
        print(f"\n[MASTER-PROMPT] Starting autonomous USA Enrichment loop...")
        print(f"Acceleration active: {max_workers} agent (throttled for Yelp).\n")
        
        while True:
            # Check if ANY source is available before starting
            available = [s for s in self.sources.values() if s.is_available(self.stats)]
            if not available:
                print("[PAUSE] All API sources on cooldown. Waiting 2 mins before retry...")
                time.sleep(120)
                self.stats = self._load_stats()
                continue
            
            print(f"[ACTIVE] Sources available: {[s.name for s in available]}")
            random.shuffle(self.cities)
            
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                futures = []
                for loc in self.cities:
                    for trade in trades:
                        futures.append(executor.submit(self.process_gap, loc, trade))
                
                for future in as_completed(futures):
                    try:
                        res = future.result()
                        if res == "STOP":
                            # Don't wait, just break inner loop and check sources again
                            executor.shutdown(wait=False, cancel_futures=True)
                            break
                    except: continue
            
            print("\n[LOOP] Cycle complete. Checking API availability...")
            time.sleep(5)

if __name__ == "__main__":
    try:
        MCPOrchestrator().run()
    except KeyboardInterrupt:
        print("\n[END] Stopped by user")
