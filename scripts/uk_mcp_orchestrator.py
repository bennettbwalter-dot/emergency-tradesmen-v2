#!/usr/bin/env python3
"""
UK MCP ORCHESTRATION LAYER
--------------------------
Specifically for emergencytradesmen.net (UK).
Ensures zero mixing with US data.
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
    "yelp": {"daily": 4950},
    "foursquare": {"monthly": 99000},
    "here": {"monthly": 29142}
}

STATS_FILE = os.path.join(os.path.dirname(__file__), 'usage_stats_uk.json')

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
        if self.is_dead: return False
        if datetime.now() < self.cooldown_until: return False
        
        limits = SAFETY_LIMITS.get(self.name, {})
        stats = current_stats.get(self.name, {})
        
        if "daily" in limits and stats.get("daily_calls", 0) >= limits["daily"]: return False
        if "monthly" in limits and stats.get("monthly_calls", 0) >= limits["monthly"]: return False
                
        return True

class RichDataScraper:
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
            found = {'email': None, 'social_links': {}}
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            if email_match:
                email = email_match.group(0).lower()
                if not any(x in email for x in ['example.com', 'sentry.io', 'wixpress.com']):
                    found['email'] = email
            return found
        except: return {}

# =============================================================================
# API WRAPPERS
# =============================================================================

class YelpAPI:
    @staticmethod
    def search(api_key: str, trade: str, city: str) -> List[Dict]:
        url = "https://api.yelp.com/v3/businesses/search"
        headers = {"Authorization": f"Bearer {api_key}"}
        params = {"term": trade.replace("-", " "), "location": f"{city}, UK", "limit": 10}
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.status_code == 200:
                found = []
                for b in resp.json().get("businesses", []):
                    found.append({
                        "name": b['name'], 
                        "phone": b.get("display_phone") or b.get("phone"), 
                        "source": "yelp", 
                        "rating": b.get("rating"),
                        "review_count": b.get("review_count"),
                        "website": b.get("url"),
                        "address": ", ".join(b.get("location", {}).get("display_address", []))
                    })
                return found
            return []
        except: return []

class HereAPI:
    @staticmethod
    def search(api_key: str, trade: str, city: str) -> List[Dict]:
        url = "https://discover.search.hereapi.com/v1/discover"
        params = {"q": f"{trade.replace('-', ' ')} in {city}, UK", "apiKey": api_key, "limit": 10}
        try:
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                found = []
                for item in resp.json().get("items", []):
                    contacts = item.get("contacts", [])
                    phone = ""
                    if contacts and "phone" in contacts[0] and contacts[0]["phone"]:
                        phone = contacts[0]["phone"][0].get("value", "")
                    website = None
                    if contacts and "www" in contacts[0] and contacts[0]["www"]:
                        website = contacts[0]["www"][0].get("value")
                    found.append({
                        "name": item.get("title", ""),
                        "phone": phone,
                        "source": "here",
                        "address": ", ".join(item.get("address", {}).get("label", "").split(",")),
                        "website": website
                    })
                return found
            return []
        except: return []

# =============================================================================
# ORCHESTRATOR
# =============================================================================

class UKMCPOrchestrator:
    def __init__(self):
        self.stats = self._load_stats()
        self.sources = {}
        self._init_sources()
        url = os.getenv("VITE_SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")
        self.sb = create_client(url, key)
        self.found_added = 0
        self.lock = threading.Lock()

    def _init_sources(self):
        if os.getenv("YELP_API_KEY"): self.sources["yelp"] = APISource("yelp", os.getenv("YELP_API_KEY"))
        if os.getenv("HERE_API_KEY"): self.sources["here"] = APISource("here", os.getenv("HERE_API_KEY"))

    def _load_stats(self) -> Dict:
        if os.path.exists(STATS_FILE):
            try:
                with open(STATS_FILE, 'r') as f: return json.load(f)
            except: pass
        return {"yelp": {"daily_calls": 0, "last_reset": datetime.now().strftime('%Y-%m-%d')}, 
                "here": {"monthly_calls": 0, "last_reset_month": datetime.now().strftime('%Y-%m')}}

    def _load_gaps(self):
        gap_file = os.path.join(os.path.dirname(__file__), 'uk_listing_gaps.json')
        if os.path.exists(gap_file):
            with open(gap_file, 'r', encoding='utf-8') as f: return json.load(f)
        return []

    def _save_stats(self):
        with self.lock:
            with open(STATS_FILE, 'w') as f: json.dump(self.stats, f, indent=4)

    def search(self, trade, city) -> List[Dict]:
        available = [s for s in self.sources.values() if s.is_available(self.stats)]
        for src in available:
            print(f"  [API-UK] Trying {src.name} for {trade} in {city}...")
            if src.name == "yelp": res = YelpAPI.search(src.api_key, trade, city)
            elif src.name == "here": res = HereAPI.search(src.api_key, trade, city)
            else: res = []
            
            with self.lock:
                if src.name == "yelp": self.stats["yelp"]["daily_calls"] += 1
                else: self.stats[src.name]["monthly_calls"] += 1
            self._save_stats()
            if res: return res
        return []

    def insert(self, biz, trade, city):
        if not biz.get('phone'): return False
        try:
            exists = self.sb.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).eq("country_code", "GB").execute()
            if exists.data: return False

            slug = f"{re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')}-{str(uuid.uuid4())[:8]}"
            data = {
                "id": str(uuid.uuid4()), "name": biz['name'], "slug": slug,
                "trade": trade, "city": city, "country_code": "GB",
                "phone": biz['phone'], "address": biz.get('address') or city,
                "verified": True, "tier": "standard", "created_at": datetime.now().isoformat(),
                "website": biz.get('website'), "rating": biz.get('rating'), "review_count": biz.get('review_count', 0)
            }
            self.sb.table("businesses").insert(data).execute()
            return True
        except Exception as e:
            print(f"      [!] Insert Error: {e}")
            return False

    def process_gap(self, gap):
        res = self.sb.table("businesses").select("id", count="exact").eq("trade", gap['trade']).eq("city", gap['city']).eq("country_code", "GB").execute()
        if (res.count or 0) >= 5: return 0
        needed = 5 - (res.count or 0)
        results = self.search(gap['trade'], gap['city'])
        added = 0
        for biz in results:
            if self.insert(biz, gap['trade'], gap['city']):
                added += 1
                if added >= needed: break
        return added

    def run(self, max_workers=3):
        gaps = self._load_gaps()
        print(f"\n[ORCHESTRA-UK] Starting Gap-Fill for UK (GB)...")
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            executor.map(self.process_gap, gaps)
        print("\n[UK] Cycle complete.")

if __name__ == "__main__":
    UKMCPOrchestrator().run()
