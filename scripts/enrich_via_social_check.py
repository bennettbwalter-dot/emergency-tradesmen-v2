import os
import requests
import json
import time
import re
from urllib.parse import quote
import concurrent.futures
import random

"""
DEEP DIVE APPROACH: Direct Social URL Enumeration

Instead of searching, we:
1. Take each business name
2. Clean it (remove Ltd, spaces, special chars)
3. Construct potential URLs: facebook.com/{name}, instagram.com/{name}, linkedin.com/company/{name}
4. Make fast HEAD requests to check if the page exists (200 OK)
5. Save valid URLs

This is MUCH faster than search scraping and bypasses rate limits.
"""

# --- Configuration ---
BATCH_SIZE = 100
WORKER_THREADS = 10  # HEAD requests are lightweight, can go fast
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
}

def get_random_agent():
    return random.choice(USER_AGENT_LIST)

def clean_name_for_url(name):
    """
    Converts 'Smith & Sons Plumbing Ltd' to 'smithsonsplumbing'
    """
    # 1. Lowercase
    name = name.lower()
    # 2. Remove common suffixes
    name = re.sub(r'\b(ltd|limited|llp|plc|inc)\b', '', name)
    # 3. Replace & with 'and'
    name = name.replace('&', 'and')
    # 4. Remove all non-alphanumeric
    name = re.sub(r'[^a-z0-9]', '', name)
    return name.strip()

def clean_name_for_linkedin(name):
    """
    LinkedIn company URLs often use hyphens: 'smith-sons-plumbing'
    """
    # 1. Lowercase
    name = name.lower()
    # 2. Remove common suffixes
    name = re.sub(r'\b(ltd|limited|llp|plc|inc)\b', '', name)
    # 3. Replace & with 'and'
    name = name.replace('&', 'and')
    # 4. Replace spaces/special chars with hyphens
    name = re.sub(r'[^a-z0-9]+', '-', name)
    # 5. Clean up multiple hyphens and trim
    name = re.sub(r'-+', '-', name).strip('-')
    return name

def check_url_exists(url):
    """
    Fast HEAD request to check if a URL is valid (200 OK).
    Returns True/False.
    """
    headers = {'User-Agent': get_random_agent()}
    try:
        # Use HEAD for speed, but some sites require GET
        resp = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if resp.status_code == 200:
            return True
        # If HEAD fails, try GET (some sites block HEAD)
        if resp.status_code in [403, 405]:
            resp = requests.get(url, headers=headers, timeout=5, stream=True)
            resp.close()  # Don't download body
            return resp.status_code == 200
        return False
    except:
        return False

def enumerate_social_urls(business):
    """
    Constructs and checks potential social URLs for a business.
    """
    name = business.get('name', '')
    clean_name = clean_name_for_url(name)
    linkedin_name = clean_name_for_linkedin(name)  # Hyphenated version for LinkedIn
    
    if not clean_name or len(clean_name) < 3:
        return None
    
    print(f"> Checking: {name} -> '{clean_name}' / '{linkedin_name}'...")
    
    # Potential URL patterns
    candidates = {
        'facebook': [
            f"https://www.facebook.com/{clean_name}",
            f"https://www.facebook.com/{clean_name}uk",
            f"https://www.facebook.com/{clean_name}ltd",
            f"https://www.facebook.com/{clean_name}official",
            f"https://www.facebook.com/{linkedin_name}",  # Hyphenated version
            f"https://www.facebook.com/{linkedin_name}uk",
            f"https://www.facebook.com/the{clean_name}",
        ],
        'instagram': [
            f"https://www.instagram.com/{clean_name}",
            f"https://www.instagram.com/{clean_name}_uk",
            f"https://www.instagram.com/{clean_name}ltd",
            f"https://www.instagram.com/{clean_name}official",
        ],
        'linkedin': [
            f"https://www.linkedin.com/company/{linkedin_name}",
            f"https://www.linkedin.com/company/{clean_name}",
            f"https://uk.linkedin.com/company/{linkedin_name}",
            f"https://www.linkedin.com/company/{linkedin_name}-uk",
            f"https://www.linkedin.com/company/{linkedin_name}-ltd",
        ],
        'twitter': [
            f"https://twitter.com/{clean_name}",
            f"https://x.com/{clean_name}",
            f"https://twitter.com/{clean_name}uk",
        ],
        'tiktok': [
            f"https://www.tiktok.com/@{clean_name}",
            f"https://www.tiktok.com/@{clean_name}uk",
            f"https://www.tiktok.com/@{clean_name}ltd",
            f"https://www.tiktok.com/@{linkedin_name}",  # Hyphenated version
        ]
    }
    
    found_links = {}
    
    for platform, urls in candidates.items():
        for url in urls:
            if check_url_exists(url):
                found_links[platform] = url
                print(f"  $ FOUND {platform}: {url}")
                break  # Found one, move to next platform
    
    if found_links:
        return {'id': business['id'], 'updates': {'social_links': found_links}}
    
    return None

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    print("=" * 60)
    print("DEEP DIVE: Direct Social URL Enumeration")
    print("=" * 60)
    print(f"Workers: {WORKER_THREADS}")
    print("Strategy: Constructing potential URLs and validating them directly.")
    print()
    
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
        query_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&select=id,name&limit={BATCH_SIZE}&offset={offset}&order=id"
        
        try:
            resp = requests.get(query_url, headers=headers_supabase)
            businesses = resp.json()
            
            if not businesses:
                print("\n*** END OF DATABASE ***")
                break
                
            batch_to_process = [b for b in businesses if b['id'] not in existing_ids]
            
            if not batch_to_process:
                offset += len(businesses)
                continue
            
            print(f"\n--- Processing batch of {len(batch_to_process)} (Offset {offset}) ---")
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=WORKER_THREADS) as executor:
                results = list(executor.map(enumerate_social_urls, batch_to_process))
                
            files_saved = 0
            for res in results:
                if res:
                    save_to_backup(res)
                    existing_ids.add(res['id'])
                    total_found += 1
                    files_saved += 1
            
            print(f"--- Saved {files_saved} new records. Total Session: {total_found} ---")
            offset += len(businesses)
            
        except Exception as e:
            print(f"Loop Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
