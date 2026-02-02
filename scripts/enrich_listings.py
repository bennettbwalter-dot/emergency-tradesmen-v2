import os
import requests
import json
import re
import time
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import signal
import sys

# --- Configuration ---
BATCH_SIZE = 50
DELAY_BETWEEN_REQUESTS = 0.5
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
BACKUP_FILE = "scraped_data_backup.jsonl"
MAX_SECONDARY_PAGES = 5 # "Deep dive" - check up to 5 internal pages per site

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

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# --- Scraping Logic ---

SOCIAL_DOMAINS = {
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'linkedin': 'linkedin.com',
    'twitter': ['twitter.com', 'x.com'],
    'tiktok': 'tiktok.com'
}

def extract_socials_and_email(html, base_url):
    soup = BeautifulSoup(html, 'html.parser')
    text = soup.get_text()
    
    found_data = {
        'email': None,
        'social_links': {
            'facebook': None,
            'instagram': None,
            'linkedin': None,
            'twitter': None,
            'tiktok': None
        },
        'secondary_links': [] # Links to check if we miss data
    }

    # 1. Find Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        found_data['email'] = email_match.group(0)
    else:
        mailto = soup.select_one('a[href^="mailto:"]')
        if mailto:
            found_data['email'] = mailto['href'].replace('mailto:', '').split('?')[0]

    # 2. Find Social Links & Internal "Contact" links
    for link in soup.find_all('a', href=True):
        href = link['href']
        try:
            full_url = urljoin(base_url, href)
        except:
            continue
        
        lower_url = full_url.lower()
        lower_text = link.get_text().lower()

        # Check for social
        is_social = False
        for platform, domain in SOCIAL_DOMAINS.items():
            if isinstance(domain, list):
                if any(d in lower_url for d in domain):
                     if found_data['social_links'][platform] is None:
                        found_data['social_links'][platform] = full_url
                        is_social = True
            elif domain in lower_url:
                if 'sharer' not in lower_url and 'share' not in lower_url:
                    if found_data['social_links'][platform] is None:
                        found_data['social_links'][platform] = full_url
                        is_social = True
        
        # Identify "Contact" or "About" pages for deep scan
        if not is_social and base_url in full_url: # Internal link
            if any(k in lower_url or k in lower_text for k in ['contact', 'about', 'connect', 'touch']):
                if full_url not in found_data['secondary_links']:
                     found_data['secondary_links'].append(full_url)

    return found_data

def save_to_backup(data):
    with open(BACKUP_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

def process_business(business):
    print(f"\nProcessing: {business['name']} (ID: {business['id']})")
    
    website = business.get('website')
    if not website:
        return None

    if not website.startswith('http'):
        website = 'https://' + website

    updates = {}
    
    try:
        print(f"  - Visiting {website}...")
        resp = requests.get(website, headers={'User-Agent': USER_AGENT}, timeout=8)
        
        if resp.status_code == 200:
            extracted = extract_socials_and_email(resp.text, website)
            
            # --- Auto-Merge Logic ---
            new_email = extracted['email']
            new_socials = extracted['social_links']
            
            # DEEP CRAWL: If missing social or email, try secondary pages
            has_all_socials = any(new_socials.values())
            
            if (not new_email or not has_all_socials) and extracted['secondary_links']:
                print(f"  > Missing info. Deep crawling {len(extracted['secondary_links'][:MAX_SECONDARY_PAGES])} internal pages...")
                
                for sub_url in extracted['secondary_links'][:MAX_SECONDARY_PAGES]:
                    try:
                        print(f"    - Scanning {sub_url}...")
                        sub_resp = requests.get(sub_url, headers={'User-Agent': USER_AGENT}, timeout=5)
                        if sub_resp.status_code == 200:
                            sub_extracted = extract_socials_and_email(sub_resp.text, sub_url)
                            
                            # Merge found data
                            if not new_email and sub_extracted['email']:
                                print(f"    + Found Email on sub-pge: {sub_extracted['email']}")
                                new_email = sub_extracted['email']
                                
                            for p, url in sub_extracted['social_links'].items():
                                if url and not new_socials[p]:
                                    print(f"    + Found {p} on sub-page: {url}")
                                    new_socials[p] = url
                    except:
                        pass
            
            # --- Final Merge with Business Object ---
            
            # Update Email if missing
            if not business.get('email') and new_email:
                print(f"  + Confirmed Email: {new_email}")
                updates['email'] = new_email
            
            # Update Socials
            current_socials = business.get('social_links') or {}
            
            merged_socials = current_socials.copy()
            has_new_social_in_update = False
            
            for platform, url in new_socials.items():
                if url and not merged_socials.get(platform):
                    merged_socials[platform] = url
                    print(f"  + Confirmed {platform}: {url}")
                    has_new_social_in_update = True
            
            if has_new_social_in_update or not business.get('social_links'):
                updates['social_links'] = merged_socials

    except Exception as e:
        print(f"  - Failed to scrape: {e}")
        
    return updates

# --- Main Loop ---

def main():
    print("Starting Deep-Scan Fault-Tolerant Enrichment...")
    print("Strategies: Homepage Scrape + Contact/About Page Deep Crawl")
    print(f"Backup File: {BACKUP_FILE}")
    print("Press Ctrl+C to stop.")

    # Load existing IDs to skip
    existing_backup_ids = set()
    if os.path.exists(BACKUP_FILE):
        print("Loading existing backup to skip duplicates...")
        with open(BACKUP_FILE, 'r') as f:
            for line in f:
                if line.strip():
                    try:
                        data = json.loads(line)
                        if 'id' in data:
                            existing_backup_ids.add(data['id'])
                    except:
                        pass
    print(f"Loaded {len(existing_backup_ids)} already enriched IDs. Focusing on the rest...")

    # Start from 0 to ensure we re-attempt any skipped records and verify the entire dataset.
    offset = 0
    total_processed = 0
    
    while True:
        # Fetch GB businesses with websites to prioritize valid UK listings
        query_url = f"{supabase_url}/rest/v1/businesses?country_code=eq.GB&website=not.is.null&select=*&limit={BATCH_SIZE}&offset={offset}&order=id"
        
        try:
            resp = requests.get(query_url, headers=headers)
            if resp.status_code != 200:
                print(f"Failed to fetch businesses: {resp.text}")
                time.sleep(5)
                continue
                
            businesses = resp.json()
            
            if not businesses:
                print("Cycle complete. Restarting from offset 0...")
                offset = 0
                time.sleep(5)
                continue
                
            print(f"\n>> Fetched batch of {len(businesses)} (Offset: {offset})...")
            
            for bus in businesses:
                # OPTIMIZATION: Skip if we already found data for this ID in our local backup
                # This ensures we are "digging" into new/unknown territory only.
                if bus['id'] in existing_backup_ids:
                    print(f"  - Skipping {bus['name']} (Already enriched in backup)")
                    total_processed += 1
                    continue
                    
                updates = process_business(bus)
                
                if updates:
                    # Try to save to DB
                    patch_url = f"{supabase_url}/rest/v1/businesses?id=eq.{bus['id']}"
                    patch_resp = requests.patch(patch_url, headers=headers, json=updates)
                    
                    if patch_resp.status_code in [200, 204]:
                        print("  -> Database updated.")
                    else:
                        print(f"  -> DB Save Failed ({patch_resp.status_code}). Saving to local backup.")
                        backup_entry = {'id': bus['id'], 'updates': updates}
                        save_to_backup(backup_entry)
                
                total_processed += 1
                time.sleep(DELAY_BETWEEN_REQUESTS)
            
            offset += len(businesses)
            
        except Exception as e:
            print(f"Critical error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
