import os
import requests
import json
import time
import re
from urllib.parse import quote
import concurrent.futures
import random
from bs4 import BeautifulSoup

"""
US BUSINESS ENRICHMENT - Direct Social URL Enumeration + Email Scraping

IMPORTANT: This script is for US businesses ONLY.
- Uses country_code=eq.US filter
- Saves to scraped_data_backup_us.jsonl (SEPARATE from UK data)
- No UK-specific URL patterns
- Also scrapes emails from business websites
"""

# --- Configuration ---
BATCH_SIZE = 100
WORKER_THREADS = 10
BACKUP_FILE = "scraped_data_backup_us.jsonl"  # SEPARATE from UK
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
    """Converts 'Smith & Sons Plumbing LLC' to 'smithsonsplumbing'"""
    name = name.lower()
    name = re.sub(r'\b(llc|inc|corp|corporation|co|company)\b', '', name)
    name = name.replace('&', 'and')
    name = re.sub(r'[^a-z0-9]', '', name)
    return name.strip()

def clean_name_hyphenated(name):
    """For LinkedIn: 'smith-sons-plumbing'"""
    name = name.lower()
    name = re.sub(r'\b(llc|inc|corp|corporation|co|company)\b', '', name)
    name = name.replace('&', 'and')
    name = re.sub(r'[^a-z0-9]+', '-', name)
    name = re.sub(r'-+', '-', name).strip('-')
    return name

def scrape_email_from_website(url):
    """Scrapes a website for email addresses."""
    if not url:
        return None
    
    # Ensure URL has protocol
    if not url.startswith('http'):
        url = 'https://' + url
    
    headers = {'User-Agent': get_random_agent()}
    try:
        resp = requests.get(url, headers=headers, timeout=8)
        if resp.status_code != 200:
            return None
        
        # Look for email patterns in the page
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, resp.text)
        
        # Filter out common non-business emails
        bad_domains = ['example.com', 'email.com', 'domain.com', 'sentry.io', 'wixpress.com']
        good_emails = [e for e in emails if not any(bad in e.lower() for bad in bad_domains)]
        
        if good_emails:
            return good_emails[0]  # Return first valid email
        return None
    except:
        return None

def check_url_exists(url):
    """Fast HEAD request to check if a URL is valid."""
    headers = {'User-Agent': get_random_agent()}
    try:
        resp = requests.head(url, headers=headers, timeout=5, allow_redirects=True)
        if resp.status_code == 200:
            return True
        if resp.status_code in [403, 405]:
            resp = requests.get(url, headers=headers, timeout=5, stream=True)
            resp.close()
            return resp.status_code == 200
        return False
    except:
        return False

def enumerate_social_urls(business):
    """Constructs and checks potential social URLs for a US business. Also scrapes email."""
    name = business.get('name', '')
    website = business.get('website', '')
    clean_name = clean_name_for_url(name)
    hyphen_name = clean_name_hyphenated(name)
    
    if not clean_name or len(clean_name) < 3:
        return None
    
    print(f"> [US] Checking: {name} -> '{clean_name}'...")
    
    # US-specific URL patterns (NO UK patterns)
    candidates = {
        'facebook': [
            f"https://www.facebook.com/{clean_name}",
            f"https://www.facebook.com/{clean_name}llc",
            f"https://www.facebook.com/{clean_name}inc",
            f"https://www.facebook.com/{clean_name}official",
            f"https://www.facebook.com/{hyphen_name}",
            f"https://www.facebook.com/the{clean_name}",
        ],
        'instagram': [
            f"https://www.instagram.com/{clean_name}",
            f"https://www.instagram.com/{clean_name}llc",
            f"https://www.instagram.com/{clean_name}official",
            f"https://www.instagram.com/{clean_name}_",
        ],
        'linkedin': [
            f"https://www.linkedin.com/company/{hyphen_name}",
            f"https://www.linkedin.com/company/{clean_name}",
            f"https://www.linkedin.com/company/{hyphen_name}-llc",
            f"https://www.linkedin.com/company/{hyphen_name}-inc",
        ],
        'twitter': [
            f"https://twitter.com/{clean_name}",
            f"https://x.com/{clean_name}",
        ],
        'tiktok': [
            f"https://www.tiktok.com/@{clean_name}",
            f"https://www.tiktok.com/@{hyphen_name}",
        ],
        'yelp': [
            # Yelp is huge in the US
            f"https://www.yelp.com/biz/{hyphen_name}",
        ]
    }
    
    found_links = {}
    found_email = None
    
    # Check social URLs
    for platform, urls in candidates.items():
        for url in urls:
            if check_url_exists(url):
                found_links[platform] = url
                print(f"  $ FOUND {platform}: {url}")
                break
    
    # Scrape email from website if available
    if website:
        found_email = scrape_email_from_website(website)
        if found_email:
            print(f"  @ FOUND email: {found_email}")
    
    if found_links or found_email:
        result = {'id': business['id'], 'updates': {'social_links': found_links}}
        if found_email:
            result['updates']['email'] = found_email
        return result
    
    return None

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def main():
    print("=" * 60)
    print("US BUSINESS ENRICHMENT - Direct Social URL Enumeration")
    print("=" * 60)
    print(f"Workers: {WORKER_THREADS}")
    print(f"Backup: {BACKUP_FILE}")
    print("Target: country_code = US ONLY")
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
    print(f"Skipping {len(existing_ids)} previously processed US businesses.")
    
    offset = 0
    total_found = 0
    
    while True:
        # CRITICAL: country_code=eq.US - US businesses ONLY
        # Also fetches website for email scraping
        query_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.US&select=id,name,website&limit={BATCH_SIZE}&offset={offset}&order=id"
        
        try:
            resp = requests.get(query_url, headers=headers_supabase)
            businesses = resp.json()
            
            if not businesses:
                print("\n*** END OF US DATABASE ***")
                break
                
            batch_to_process = [b for b in businesses if b['id'] not in existing_ids]
            
            if not batch_to_process:
                offset += len(businesses)
                continue
            
            print(f"\n--- Processing batch of {len(batch_to_process)} US businesses (Offset {offset}) ---")
            
            with concurrent.futures.ThreadPoolExecutor(max_workers=WORKER_THREADS) as executor:
                results = list(executor.map(enumerate_social_urls, batch_to_process))
                
            files_saved = 0
            for res in results:
                if res:
                    save_to_backup(res)
                    existing_ids.add(res['id'])
                    total_found += 1
                    files_saved += 1
            
            print(f"--- Saved {files_saved} new US records. Total Session: {total_found} ---")
            offset += len(businesses)
            
        except Exception as e:
            print(f"Loop Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
