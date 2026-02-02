import os
import requests
import json
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import quote
import concurrent.futures
import random

# --- Configuration ---
BATCH_SIZE = 100
WORKER_THREADS = 5  # Yell is usually robust, 5 threads is fast.
BACKUP_FILE = "scraped_data_backup.jsonl"
USER_AGENT_LIST = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
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

def get_random_agent():
    return random.choice(USER_AGENT_LIST)

def search_yell(name, city):
    """
    Searches Yell.com for the business.
    """
    # Clean name: remove Ltd, Limited, special chars
    clean_name = re.sub(r' ltd| limited', '', name.lower(), flags=re.IGNORECASE).strip()
    encoded_name = quote(clean_name)
    encoded_city = quote(city)
    
    url = f"https://www.yell.com/ucs/UcsSearchAction.do?keywords={encoded_name}&location={encoded_city}"
    headers = {
        'User-Agent': get_random_agent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://www.yell.com/'
    }
    
    try:
        # time.sleep(random.uniform(1.0, 3.0)) # Yell is tougher, keep slight delay
        
        resp = requests.get(url, headers=headers, timeout=10)
        
        if resp.status_code == 403 or resp.status_code == 429:
             print("X Yell Blocked (403/429).")
             return None
             
        if resp.status_code != 200:
            return None
            
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Yell results structure: .businessCapsule
        # We take the first result that looks like a match
        
        results = soup.select('.businessCapsule')
        if not results:
            return None
            
        # Analyze first result
        capsule = results[0]
        
        # Get Website
        website = None
        web_btn = capsule.select_one('a.businessCapsule--ctaItem--website')
        if web_btn and 'href' in web_btn.attrs:
            website = web_btn['href']
            
        # Check for social links (Yell sometimes has them via 'View Profile')
        # But usually we just want the website to then crawl IT.
        
        # If we found a website, that is a HIT.
        if website:
            return {'website': website}
            
        return None
        
    except Exception as e:
        # print(f"X Yell Error: {e}")
        return None

def process_business_via_yell(business):
    start = time.time()
    try:
        name = business.get('name', '')
        city = "UK"
        if business.get('address'):
            parts = business['address'].split(',')
            if len(parts) > 1:
                city = parts[-2].strip() 
        
        print(f"> Yell: {name} in {city}...")
        
        result = search_yell(name, city)
        
        if result and result.get('website'):
            print(f"  $ HIT: Found Website on Yell: {result['website']}")
            return {'id': business['id'], 'updates': {'website': result['website']}}
        
        # If Yell fails, we just log it.
        # print(f"  . No Yell result for {name}")
        return None

    except Exception as e:
        return None

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    print("Starting Multi-Threaded Yell.com Directory Scraper...")
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
                results = list(executor.map(process_business_via_yell, batch_to_process))
                
            files_saved = 0
            for res in results:
                if res:
                    save_to_backup(res)
                    existing_ids.add(res['id'])
                    total_found += 1
                    files_saved += 1
            
            print(f"--- Batch Complete. Saved {files_saved} new records. ---")
            offset += len(businesses)
            
            # Yell cooldown is crucial
            time.sleep(2)
            
        except Exception as e:
            print(f"Critical Loop Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
