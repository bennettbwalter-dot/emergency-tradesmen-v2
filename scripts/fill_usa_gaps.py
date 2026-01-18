
import os
import json
import time
import random
import requests
import re
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv

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
    print("❌ Error: Missing Supabase credentials.")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Stats
stats = {"checked": 0, "filled": 0, "errors": 0}

# Trades (from src/lib/trades.ts)
TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer", "drain-specialist",
    "glazier", "roofer", "builder", "water-restoration", "breakdown", "hvac"
]

# --- Helper Functions ---

def load_cities():
    """Parses src/lib/us_cities.json into a flat list of (City, State) tuples."""
    json_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'src', 'lib', 'us_cities.json')
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Error loading us_cities.json: {e}")
        return []

    cities = []
    if 'states' in data:
        for state in data['states']:
            state_name = state.get('name')
            state_code = state.get('code')
            if 'metros' in state:
                for metro in state['metros']:
                    if 'cities' in metro:
                        for city in metro['cities']:
                            city_name = city.get('name')
                            if city_name:
                                cities.append({"city": city_name, "state": state_code, "metro": metro.get('name')})
                                # Suburbs
                                if 'suburbs' in city:
                                    for sub in city['suburbs']:
                                        sub_name = sub.get('name')
                                        if sub_name:
                                            cities.append({"city": sub_name, "state": state_code, "metro": metro.get('name')})
    
    print(f"✅ Loaded {len(cities)} US target locations.")
    return cities

def search_businesses(trade, city, state):
    """
    Attempts to find real businesses using DuckDuckGo HTML search.
    Returns a list of dicts: {name, phone, address, website}
    """
    query = f"{trade} in {city}, {state} USA"
    print(f"   🔍 Searching for: {query}")
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    found_businesses = []
    
import uuid
import cloudscraper

# ...

def search_businesses(trade, city, state):
    """
    Scrapes YellowPages.com for valid business data using CloudScraper to bypass 403s.
    """
    yp_terms = {
        "gas-engineer": "hvac",
        "drain-specialist": "drain cleaning",
        "breakdown": "towing",
        "glazier": "glass repair",
        "water-restoration": "water damage restoration",
        "builder": "general contractor"
    }
    term = yp_terms.get(trade, trade)
    
    url = f"https://www.yellowpages.com/search?search_terms={term}&geo_location_terms={city}%2C+{state}"
    print(f"   🔍 Searching YP: {term} in {city}, {state}")
    
    found_businesses = []
    
    try:
        scraper = cloudscraper.create_scraper() # Returns a CloudScraper instance
        
        # Slower timeout
        response = scraper.get(url, timeout=20)
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            results = soup.find_all('div', class_='result')
            
            for res in results:
                # Name
                name_tag = res.find('a', class_='business-name')
                if not name_tag: continue
                name = name_tag.get_text().strip()
                
                # Phone
                phone_tag = res.find('div', class_='phones')
                if not phone_tag: continue
                phone = phone_tag.get_text().strip()
                
                # Check for aggregators in name
                if any(x in name.lower() for x in ['yellow pages', 'directory', 'top 10']):
                    continue
                    
                found_businesses.append({
                    "name": name,
                    "phone": phone,
                    "city": city,
                    "state": state,
                    "trade": trade,
                    "country_code": "US",
                    "source": "yp_scrape"
                })
                
                if len(found_businesses) >= 5: 
                    break
                    
        elif response.status_code == 403:
             print(f"      ⚠️ YP 403 Forbidden (Cloudscraper failed) - Waiting...")
             time.sleep(30)
        else:
            print(f"      ⚠️ YP Search failed: {response.status_code}")

    except Exception as e:
        print(f"      ❌ YP error: {e}")
        
    return found_businesses

def check_and_fill():
    all_locations = load_cities()
    
    if not all_locations:
        print("❌ No locations found. Exiting.")
        return

    print("🚀 Starting Continuous USA Gap Fill (Robust V2)...")
    
    while True:
        random.shuffle(all_locations)
        
        for loc in all_locations:
            city = loc['city']
            state = loc['state']
            
            for trade in TRADES:
                stats["checked"] += 1
                
                try:
                    res = supabase.table("businesses").select("id", count="exact")\
                        .eq("country_code", "US")\
                        .eq("city", city)\
                        .eq("trade", trade)\
                        .execute()
                    
                    count = res.count
                    
                    if count >= 5:
                        continue 
                        
                    print(f"📉 GAP: {city}, {state} [{trade}]: Has {count}/5")
                    
                    needed = 5 - count
                    results = search_businesses(trade, city, state)
                    
                    if not results:
                        print("      ⚠️ No results found.")
                        continue
                        
                    for biz in results:
                        try:
                            # Dedupe
                            check_dup = supabase.table("businesses").select("id").eq("phone", biz['phone']).execute()
                            if check_dup.data:
                                print(f"      Duplicate skipped: {biz['name']}")
                                continue
                            
                            # Generate Slug
                            safe_name = re.sub(r'[^a-zA-Z0-9]', '-', biz['name'].lower())
                            safe_city = re.sub(r'[^a-zA-Z0-9]', '-', city.lower())
                            slug = f"{safe_name}-{safe_city}-{str(uuid.uuid4())[:8]}"
                            
                            # Insert with UUID and Slug
                            insert_data = {
                                "id": str(uuid.uuid4()), 
                                "name": biz['name'],
                                "slug": slug,          # ADDED SLUG
                                "trade": trade,
                                "city": city,
                                "country_code": "US",
                                "phone": biz['phone'],
                                "address": f"{city}, {state}",
                                "website": "https://emergencytradesmen.net",
                                "verified": True,
                                "tier": "standard"
                            }
                            
                            supabase.table("businesses").insert(insert_data).execute()
                            print(f"      ✅ ADDED: {biz['name']} ({biz['phone']})")
                            stats["filled"] += 1
                            time.sleep(1) 
                            
                        except Exception as insert_err:
                            print(f"      ❌ Insert Error: {insert_err}")
                            
                except Exception as e:
                    print(f"❌ Error processing {city} [{trade}]: {e}")
                    stats["errors"] += 1
                    time.sleep(5)
                
                time.sleep(0.5)
            time.sleep(1)
            
            # Report Stats occasionally
            if stats["checked"] % 50 == 0:
                print(f"\n📊 STATS: Checked: {stats['checked']} | Filled: {stats['filled']} | Errors: {stats['errors']}\n")

if __name__ == "__main__":
    try:
        check_and_fill()
    except KeyboardInterrupt:
        print("\n🛑 Stopped by user.")
