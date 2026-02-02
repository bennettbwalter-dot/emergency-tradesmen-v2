#!/usr/bin/env python3
"""
MULTI-SOURCE GAP FILLER
Uses multiple free APIs with automatic failover:
- Yelp Fusion API (5000/day)
- HERE Places API (250,000/month FREE)

HERE API Setup:
1. Go to: https://developer.here.com/sign-up
2. Create free account
3. Create a project and get API key
4. Add to .env: HERE_API_KEY=your_key_here
"""
import os
import json
import time
import random
import re
import uuid
import requests
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List, Dict, Optional

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
YELP_API_KEY = os.getenv("YELP_API_KEY")
HERE_API_KEY = os.getenv("HERE_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# =============================================================================
# API CLASSES
# =============================================================================

@dataclass
class APISource:
    name: str
    daily_limit: int
    calls_today: int = 0
    last_reset: datetime = field(default_factory=datetime.now)
    cooldown_until: datetime = field(default_factory=lambda: datetime.min)
    
    def is_available(self) -> bool:
        now = datetime.now()
        if now.date() > self.last_reset.date():
            self.calls_today = 0
            self.last_reset = now
        if now < self.cooldown_until:
            return False
        return self.calls_today < self.daily_limit
    
    def record_call(self):
        self.calls_today += 1
    
    def set_cooldown(self, seconds: int = 60):
        self.cooldown_until = datetime.now() + timedelta(seconds=seconds)


class YelpSearch:
    CATEGORIES = {
        "plumber": "plumbing", "electrician": "electricians", "locksmith": "locksmiths",
        "hvac": "hvac", "roofer": "roofing", "drain-specialist": "plumbing",
        "glazier": "glassandmirrors", "builder": "contractors",
        "gas-engineer": "hvac", "water-restoration": "damage_restoration"
    }
    
    @staticmethod
    def search(api_key: str, trade: str, city: str, state: str) -> List[Dict]:
        category = YelpSearch.CATEGORIES.get(trade, trade)
        url = "https://api.yelp.com/v3/businesses/search"
        headers = {"Authorization": f"Bearer {api_key}"}
        params = {"term": trade.replace("-", " "), "location": f"{city}, {state}",
                  "categories": category, "limit": 10, "sort_by": "rating"}
        
        found = []
        try:
            resp = requests.get(url, headers=headers, params=params, timeout=15)
            if resp.status_code == 200:
                for biz in resp.json().get("businesses", []):
                    phone = re.sub(r'[^\d]', '', biz.get("phone", ""))
                    if len(phone) == 11 and phone.startswith('1'):
                        phone = phone[1:]
                    if len(phone) == 10:
                        found.append({
                            "name": biz.get("name", "")[:60], "phone": phone,
                            "city": city, "state": state, "trade": trade,
                            "rating": biz.get("rating"), "source": "yelp"
                        })
                        if len(found) >= 5:
                            break
            elif resp.status_code == 429:
                return None  # Rate limited
        except:
            pass
        return found


class HereSearch:
    """HERE Places API - 250,000 free calls/month"""
    
    CATEGORIES = {
        "plumber": "700-7470", "electrician": "700-7470", "locksmith": "700-7470",
        "hvac": "700-7470", "roofer": "700-7470", "drain-specialist": "700-7470",
        "glazier": "700-7470", "builder": "700-7470",
        "gas-engineer": "700-7470", "water-restoration": "700-7470"
    }
    
    @staticmethod
    def search(api_key: str, trade: str, city: str, state: str) -> List[Dict]:
        url = "https://discover.search.hereapi.com/v1/discover"
        params = {
            "q": f"{trade.replace('-', ' ')} {city} {state}",
            "in": "countryCode:USA",
            "apiKey": api_key,
            "limit": 10
        }
        
        found = []
        try:
            resp = requests.get(url, params=params, timeout=15)
            if resp.status_code == 200:
                for item in resp.json().get("items", []):
                    contacts = item.get("contacts", [])
                    phone = ""
                    for contact in contacts:
                        if contact.get("phone"):
                            for p in contact["phone"]:
                                phone = re.sub(r'[^\d]', '', p.get("value", ""))
                                if len(phone) >= 10:
                                    break
                        if phone:
                            break
                    
                    if len(phone) == 11 and phone.startswith('1'):
                        phone = phone[1:]
                    
                    if len(phone) == 10:
                        found.append({
                            "name": item.get("title", "")[:60], "phone": phone,
                            "city": city, "state": state, "trade": trade,
                            "source": "here"
                        })
                        if len(found) >= 5:
                            break
            elif resp.status_code == 429:
                return None
        except:
            pass
        return found


# =============================================================================
# ORCHESTRATOR
# =============================================================================

class MultiSourceOrchestrator:
    def __init__(self):
        self.sources = {}
        self.search_fns = {}
        
        # Register Yelp
        if YELP_API_KEY:
            self.sources["yelp"] = APISource("yelp", 5000)
            self.search_fns["yelp"] = lambda t, c, s: YelpSearch.search(YELP_API_KEY, t, c, s)
            print("[+] Yelp API (5000/day)", flush=True)
        
        # Register HERE
        if HERE_API_KEY:
            self.sources["here"] = APISource("here", 8333)  # ~250k/month
            self.search_fns["here"] = lambda t, c, s: HereSearch.search(HERE_API_KEY, t, c, s)
            print("[+] HERE API (250k/month)", flush=True)
        
        if not self.sources:
            print("[ERR] No API keys configured!")
            print("Add YELP_API_KEY or HERE_API_KEY to .env")
            exit(1)
        
        self.cities = self._load_cities()
        self.stats = {"checked": 0, "filled": 0}
    
    def _load_cities(self):
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
                                if city_name and f"{city_name}|{state_code}" not in seen:
                                    seen.add(f"{city_name}|{state_code}")
                                    cities.append({"city": city_name, "state": state_code, "priority": is_priority})
        
        priority = [c for c in cities if c.get('priority')]
        other = [c for c in cities if not c.get('priority')]
        random.shuffle(priority)
        random.shuffle(other)
        return priority + other
    
    def get_available_source(self):
        for name, src in self.sources.items():
            if src.is_available():
                return name
        return None
    
    def search(self, trade: str, city: str, state: str):
        for name in list(self.sources.keys()):
            src = self.sources[name]
            if not src.is_available():
                continue
            
            result = self.search_fns[name](trade, city, state)
            src.record_call()
            
            if result is None:  # Rate limited
                src.set_cooldown(300)
                self.safe_print(f"  [{name.upper()}] Rate limited")
                continue
            
            return result
        return []
    
    def get_listing_count(self, trade: str, city: str):
        try:
            res = supabase.table("businesses").select("id", count="exact").eq("trade", trade).eq("city", city).eq("country_code", "US").execute()
            return res.count or 0
        except:
            return 0
    
    def insert_business(self, biz: Dict, trade: str, city: str, state: str):
        try:
            exists = supabase.table("businesses").select("id").eq("phone", biz['phone']).eq("trade", trade).execute()
            if exists.data:
                return None
            
            safe_name = re.sub(r'[^a-z0-9]+', '-', biz['name'].lower()).strip('-')[:50]
            safe_city = re.sub(r'[^a-z0-9]+', '-', city.lower()).strip('-')[:30]
            slug = f"{safe_name}-{safe_city}-{str(uuid.uuid4())[:8]}"
            
            insert_data = {
                "id": str(uuid.uuid4()), "name": biz['name'], "slug": slug,
                "trade": trade, "city": city, "country_code": "US",
                "phone": biz['phone'], "address": f"{city}, {state}",
                "website": "https://emergencytradesmen.net",
                "verified": True, "tier": "standard",
                "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
            }
            if biz.get('rating'):
                insert_data['rating'] = biz['rating']
            
            res = supabase.table("businesses").insert(insert_data).execute()
            return res.data[0]['id'] if res.data else None
        except:
            return None
    
    def safe_print(self, msg):
        try:
            print(msg, flush=True)
        except UnicodeEncodeError:
            print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)
    
    def run(self):
        trades = ["plumber", "electrician", "locksmith", "hvac", "roofer",
                  "drain-specialist", "glazier", "builder", "gas-engineer", "water-restoration"]
        
        self.safe_print(f"\n{'='*50}")
        self.safe_print("MULTI-SOURCE GAP FILLER")
        self.safe_print(f"Cities: {len(self.cities)} | APIs: {', '.join(self.sources.keys())}")
        self.safe_print(f"{'='*50}\n")
        
        last_report = time.time()
        
        while True:
            for loc in self.cities:
                city, state = loc['city'], loc['state']
                
                for trade in trades:
                    if not self.get_available_source():
                        self.safe_print("[!] All sources exhausted. Waiting 5m...")
                        time.sleep(300)
                        continue
                    
                    count = self.get_listing_count(trade, city)
                    if count >= 5:
                        continue
                    
                    needed = 5 - count
                    self.safe_print(f"[GAP] {city}, {state} [{trade}]: {count}/5")
                    self.stats["checked"] += 1
                    
                    results = self.search(trade, city, state)
                    
                    for biz in results[:needed]:
                        if self.insert_business(biz, trade, city, state):
                            self.safe_print(f"  [OK] {biz['name'][:35]} ({biz.get('source')})")
                            self.stats["filled"] += 1
                    
                    if time.time() - last_report > 120:
                        self.safe_print(f"\n[STATS] Checked: {self.stats['checked']} | Added: {self.stats['filled']}")
                        for name, src in self.sources.items():
                            self.safe_print(f"  {name}: {src.daily_limit - src.calls_today} remaining")
                        self.safe_print("")
                        last_report = time.time()
                    
                    time.sleep(random.uniform(0.2, 0.5))
            
            self.safe_print(f"\n[CYCLE] Complete. Added: {self.stats['filled']}\n")


if __name__ == "__main__":
    try:
        MultiSourceOrchestrator().run()
    except KeyboardInterrupt:
        print("\n[STOP]")
