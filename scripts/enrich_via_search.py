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
WORKER_THREADS = 3  # "Fast" but trying to avoid immediate IP ban
BACKUP_FILE = "scraped_data_backup.jsonl"
USER_AGENT_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
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

def search_bing(query):
    """
    Performs a search on Bing HTML.
    """
    url = "https://www.bing.com/search"
    params = {'q': query}
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.bing.com/'
    }
    
    try:
        # Sleep randomly to look human
        time.sleep(random.uniform(1.5, 4.0))
        
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        if resp.status_code != 200:
            print(f"X Bing Blocked/Error: {resp.status_code}")
            return []
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        links = []
        
        # Bing typically uses li.b_algo h2 a
        for result in soup.select('li.b_algo h2 a'):
            href = result.get('href', '')
            if href.startswith('http'):
                links.append(href)
                
        return links
        
    except Exception as e:
        print(f"X Search Error: {e}")
        return []

# Update worker to use Bing
def process_business_via_search(business):
    """
    Worker function to process a single business via Bing.
    """
    try:
        name = business.get('name', '').replace('&', 'and')
        city = "" 
        if business.get('address'):
            parts = business['address'].split(',')
            if len(parts) > 1:
                city = parts[-2].strip()
        
        query = f"{name} {city} UK social media facebook instagram"
        print(f"> Bing: {query}...")
        
        links = search_bing(query)
        
        found_socials = {}
        
        for link in links:
            lower_link = link.lower()
            for platform, domain in SOCIAL_DOMAINS.items():
                if isinstance(domain, list):
                    if any(d in lower_link for d in domain):
                         if not found_socials.get(platform):
                            found_socials[platform] = link
                elif domain in lower_link:
                    if 'sharer' not in lower_link:
                        if not found_socials.get(platform):
                             found_socials[platform] = link

        if found_socials:
             print(f"  $ HIT: Found {len(found_socials)} links for {name}")
             return {'id': business['id'], 'updates': {'social_links': found_socials}}
        else:
             print(f"  . No results for {name}")
             return None

    except Exception as e:
        print(f"Error processing {business.get('name')}: {e}")
        return None

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    print("Starting Multi-Threaded Search Scraper (DDG HTML)...")
    print(f"Workers: {WORKER_THREADS}")
    
    # Load existing IDs to skip
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
        # Fetch batch
        query_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=id,name,address&limit={BATCH_SIZE}&offset={offset}&order=id"
        
        try:
            resp = requests.get(query_url, headers=headers_supabase)
            businesses = resp.json()
            
            if not businesses:
                print("End of database reached.")
                break
                
            # Filter batch against existing
            batch_to_process = [b for b in businesses if b['id'] not in existing_ids]
            
            if not batch_to_process:
                print(f"Batch at offset {offset} fully skipped.")
                offset += len(businesses)
                continue
            
            print(f"\nProcessing batch of {len(batch_to_process)} unique records (Offset {offset})...")
            
            # Parallel Execution
            with concurrent.futures.ThreadPoolExecutor(max_workers=WORKER_THREADS) as executor:
                results = list(executor.map(process_business_via_search, batch_to_process))
                
            # Save results
            files_saved = 0
            for res in results:
                if res:
                    save_to_backup(res)
                    existing_ids.add(res['id'])
                    total_found += 1
                    files_saved += 1
            
            print(f"--- Batch Complete. Saved {files_saved} new records. Total Session Found: {total_found} ---")
            
            offset += len(businesses)
            # Small cooldown between batches to let DDG breathe
            time.sleep(2)
            
        except Exception as e:
            print(f"Critical Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
