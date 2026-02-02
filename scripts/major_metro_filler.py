#!/usr/bin/env python3
"""
MAJOR METRO GAP FILLER
Targets only high-population cities where HERE API will actually find businesses.
"""
import os
import json
import time
import re
import uuid
import requests
from typing import List, Dict

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
HERE_API_KEY = os.getenv("VITE_HERE_API") or os.getenv("HERE_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERR] Missing Supabase credentials.")
    exit(1)

if not HERE_API_KEY:
    print("[ERR] Missing HERE API key (VITE_HERE_API or HERE_API_KEY)")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Major US metros - these will have businesses
MAJOR_METROS = [
    # Texas
    {"city": "Dallas", "state": "TX"}, {"city": "Houston", "state": "TX"}, 
    {"city": "Austin", "state": "TX"}, {"city": "San Antonio", "state": "TX"},
    {"city": "Fort Worth", "state": "TX"}, {"city": "Arlington", "state": "TX"},
    {"city": "Plano", "state": "TX"}, {"city": "Frisco", "state": "TX"},
    # California
    {"city": "Los Angeles", "state": "CA"}, {"city": "San Diego", "state": "CA"},
    {"city": "San Francisco", "state": "CA"}, {"city": "San Jose", "state": "CA"},
    {"city": "Sacramento", "state": "CA"}, {"city": "Fresno", "state": "CA"},
    {"city": "Long Beach", "state": "CA"}, {"city": "Oakland", "state": "CA"},
    {"city": "Anaheim", "state": "CA"}, {"city": "Riverside", "state": "CA"},
    # Florida
    {"city": "Miami", "state": "FL"}, {"city": "Orlando", "state": "FL"},
    {"city": "Tampa", "state": "FL"}, {"city": "Jacksonville", "state": "FL"},
    {"city": "Fort Lauderdale", "state": "FL"}, {"city": "West Palm Beach", "state": "FL"},
    # New York
    {"city": "New York", "state": "NY"}, {"city": "Buffalo", "state": "NY"},
    {"city": "Rochester", "state": "NY"}, {"city": "Syracuse", "state": "NY"},
    # Arizona
    {"city": "Phoenix", "state": "AZ"}, {"city": "Scottsdale", "state": "AZ"},
    {"city": "Mesa", "state": "AZ"}, {"city": "Tucson", "state": "AZ"},
    # Other major cities
    {"city": "Chicago", "state": "IL"}, {"city": "Seattle", "state": "WA"},
    {"city": "Denver", "state": "CO"}, {"city": "Atlanta", "state": "GA"},
    {"city": "Detroit", "state": "MI"}, {"city": "Minneapolis", "state": "MN"},
    {"city": "Cleveland", "state": "OH"}, {"city": "Pittsburgh", "state": "PA"},
    {"city": "Philadelphia", "state": "PA"}, {"city": "Boston", "state": "MA"},
    {"city": "Las Vegas", "state": "NV"}, {"city": "Portland", "state": "OR"},
    {"city": "Charlotte", "state": "NC"}, {"city": "Nashville", "state": "TN"},
    {"city": "Indianapolis", "state": "IN"}, {"city": "Columbus", "state": "OH"},
    {"city": "Kansas City", "state": "MO"}, {"city": "Oklahoma City", "state": "OK"},
]

TRADES = ["plumber", "electrician", "locksmith", "hvac", "roofer",
          "drain-specialist", "glazier", "builder", "gas-engineer", "water-restoration"]


class HereSearch:
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
                print(f"  [HERE] Rate limited")
                return None
            else:
                print(f"  [HERE] Error: {resp.status_code}")
        except Exception as e:
            print(f"  [HERE] Exception: {e}")
        return found


def get_listing_count(trade: str, city: str):
    try:
        res = supabase.table("businesses").select("id", count="exact").eq("trade", trade).ilike("city", f"%{city}%").eq("country_code", "US").execute()
        return res.count or 0
    except:
        return 0


def insert_business(biz: Dict, trade: str, city: str, state: str):
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
            "verified": True, "tier": "standard",
            "created_at": time.strftime('%Y-%m-%dT%H:%M:%S')
        }
        
        res = supabase.table("businesses").insert(insert_data).execute()
        return res.data[0]['id'] if res.data else None
    except Exception as e:
        print(f"  [INSERT ERR] {e}")
        return None


def safe_print(msg):
    try:
        print(msg, flush=True)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode('ascii'), flush=True)


def main():
    safe_print("=" * 60)
    safe_print("MAJOR METRO GAP FILLER")
    safe_print(f"Cities: {len(MAJOR_METROS)} | Trades: {len(TRADES)}")
    safe_print("=" * 60 + "\n")
    
    stats = {"checked": 0, "filled": 0, "api_calls": 0}
    
    for loc in MAJOR_METROS:
        city, state = loc['city'], loc['state']
        
        for trade in TRADES:
            count = get_listing_count(trade, city)
            if count >= 5:
                continue
            
            needed = 5 - count
            safe_print(f"[GAP] {city}, {state} [{trade}]: {count}/5 (need {needed})")
            stats["checked"] += 1
            
            results = HereSearch.search(HERE_API_KEY, trade, city, state)
            stats["api_calls"] += 1
            
            if results is None:
                safe_print("  [!] Rate limited, waiting 5min...")
                time.sleep(300)
                continue
            
            if not results:
                safe_print(f"  [HERE] No results found")
            
            inserted = 0
            for biz in results[:needed]:
                if insert_business(biz, trade, city, state):
                    safe_print(f"  [OK] {biz['name'][:40]}")
                    stats["filled"] += 1
                    inserted += 1
            
            if inserted > 0:
                safe_print(f"  [+] Added {inserted} listings")
            
            time.sleep(0.3)  # Rate limit
    
    safe_print("\n" + "=" * 60)
    safe_print("COMPLETE!")
    safe_print(f"Checked: {stats['checked']} | Added: {stats['filled']} | API Calls: {stats['api_calls']}")
    safe_print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[STOP]")
