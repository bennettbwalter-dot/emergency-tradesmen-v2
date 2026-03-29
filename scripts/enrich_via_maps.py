import os
import requests
import json
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import unquote, urlparse
import concurrent.futures
import random

# --- Configuration ---
BATCH_SIZE = 100
WORKER_THREADS = 4  # Aggressive mode
BACKUP_FILE = "scraped_data_backup.jsonl"
USER_AGENT_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
]

# --- Supabase Setup ---
env_path = '.env'
if not os.path.exists(env_path):
    env_path = os.path.join('..', '.env')
supabase_url = None
supabase_key = None

if os.path.exists(env_path):
    with open(env_path, 'r') as f:
        env_content = f.read()
        url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
        key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)
        if url_match: supabase_url = url_match.group(1).strip().strip("'").strip('"')
        if key_match: supabase_key = key_match.group(1).strip().strip("'").strip('"')

headers_supabase = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

SOCIAL_DOMAINS = {
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'linkedin': 'linkedin.com',
    'twitter': ['twitter.com', 'x.com'],
    'tiktok': 'tiktok.com'
}

def get_random_agent():
    return random.choice(USER_AGENT_LIST)

def scrape_website_for_socials(url):
    """
    Visits the found website to scrape social links.
    """
    try:
        headers = {'User-Agent': get_random_agent()}
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200: return {}
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        found = {}
        
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            for platform, domain in SOCIAL_DOMAINS.items():
                if isinstance(domain, list):
                    if any(d in href for d in domain):
                         if not found.get(platform): found[platform] = a['href']
                elif domain in href:
                    if 'sharer' not in href:
                         if not found.get(platform): found[platform] = a['href']
        return found
    except:
        return {}

def search_maps(query):
    """
    Searches Google Maps HTML.
    Note: Maps often returns minimal HTML with data embedded in JS.
    We try to regex matching for http links that look like external websites.
    """
    url = f"https://www.google.com/maps/search/{query}"
    headers = {
        'User-Agent': get_random_agent(),
        'Accept-Language': 'en-GB,en;q=0.9',
        'Referer': 'https://www.google.com/'
    }
    cookies = {'CONSENT': 'YES+'} # Bypass consent page sometimes
    
    try:
        time.sleep(random.uniform(2.0, 5.0))
        resp = requests.get(url, headers=headers, cookies=cookies, timeout=15)
        
        if resp.status_code == 429:
             print("X Maps Rate Limit (429). Cooling down...")
             time.sleep(60)
             return None
             
        # Extraction Strategy 1: Look for "website" link in the chaos
        # Maps HTML is messy. Valid external site usually appears in the huge blob.
        # We look for typical URL patterns that are NOT google.
        
        # Regex to find all http/https links
        # This is "dirty" but fast.
        urls = re.findall(r'https?://[a-zA-Z0-9.-]+(?:/[a-zA-Z0-9._-]+)*', resp.text)
        
        candidates = []
        for u in urls:
            if 'google' not in u and 'gstatic' not in u and 'w3.org' not in u and 'schema.org' not in u:
                candidates.append(u)
                
        # --- NEW: Check for direct LinkedIn result in Maps (sometimes it links there) ---
        for u in candidates:
            if 'linkedin.com/company' in u or 'linkedin.com/in' in u:
                 # If Maps links directly to LinkedIn, that's a HUGE hit
                 return u # Treat LinkedIn as the "website" to scrape (scrape_website_for_socials handles it)
        
        # Heuristic: The business website is often the first non-google URL found in the listing data payload.
        if candidates:
            return candidates[0] # Try the first one
            
        return None
        
    except Exception as e:
        print(f"X Maps Error: {e}")
        return None

def process_business_via_maps(business):
    try:
        name = business.get('name', '').replace('&', 'and')
        city = "" 
        if business.get('address'):
            parts = business['address'].split(',')
            if len(parts) > 1:
                city = parts[-2].strip() 
        
        # Query: Business Name City
        query = f"{name} {city}"
        print(f"> Maps: {query}...")
        
        website_url = search_maps(query)
        
        if website_url:
            print(f"  -> Found Website: {website_url}")
            # Now scrape that website
            socials = scrape_website_for_socials(website_url)
            
            updates = {}
            if socials:
                updates['social_links'] = socials
            
            # --- NEW: Review Extraction ---
            # Attempt to extract rating/reviews from the Maps HTML text
            # Patterns: "4.8 stars", "(120)", "4.5"
            try:
                # Naive regex for rating: "4.x " or "5.0 "
                rating_match = re.search(r'(\d\.\d)\s*stars', resp.text)
                count_match = re.search(r'\(([\d,]+)\)\s*·', resp.text) # "(54) ·" common pattern
                
                if rating_match: 
                    updates['rating'] = float(rating_match.group(1))
                if count_match:
                    updates['reviews_count'] = int(count_match.group(1).replace(',', ''))
                    
                if 'rating' in updates:
                    print(f"  * Found Reviews: {updates.get('rating')} stars ({updates.get('reviews_count', '?')} reviews)")
            except:
                pass
            
            if updates:
                print(f"  $ HIT: Found Data via Maps (Socials: {len(socials)}, Reviews: {updates.get('reviews_count')})")
                return {'id': business['id'], 'updates': updates}
        
        print(f"  . No actionable data for {name}")
        return None

    except Exception as e:
        # print(f"Error: {e}")
        return None

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    print("Starting Multi-Threaded Google Maps Scraper...")
    print(f"Workers: {WORKER_THREADS}")
    
    existing_ids = set()
    if os.path.exists(BACKUP_FILE):
        with open(BACKUP_FILE, 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        data = json.loads(line)
                        if 'id' in data:
                            existing_ids.add(data['id'])
                    except:
                        pass
    print(f"Skipping {len(existing_ids)} previously processed businesses.")
    
    offset = 0
    total_found = 0
    
    while True:
        query_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=id,name,address&limit={BATCH_SIZE}&offset={offset}&order=id"
        
        try:
            resp = requests.get(query_url, headers=headers_supabase)
            businesses = resp.json()
            
            if not businesses:
                break
                
            batch_to_process = [b for b in businesses if b['id'] not in existing_ids]
            
            if not batch_to_process:
                offset += len(businesses)
                continue
            
            print(f"\nProcessing batch of {len(batch_to_process)} unique records (Offset {offset})...")
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=WORKER_THREADS) as executor:
                results = list(executor.map(process_business_via_maps, batch_to_process))
                
            files_saved = 0
            for res in results:
                if res:
                    save_to_backup(res)
                    existing_ids.add(res['id'])
                    total_found += 1
                    files_saved += 1
            
            print(f"--- Batch Complete. Saved {files_saved} new records. ---")
            offset += len(businesses)
            time.sleep(2)
            
        except Exception as e:
            print(f"Critical Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
