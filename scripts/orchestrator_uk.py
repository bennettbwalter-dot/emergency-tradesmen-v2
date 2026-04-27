import os
import sys

# Ensure UTF-8 for Windows redirection
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

import requests
import json
import re
import time
import hashlib
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup

# --- Configuration ---
DELAY_BETWEEN_REQUESTS = 1
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
MAX_SECONDARY_PAGES = 5

STANDARD_TRADES = [
    "plumber", "electrician", "locksmith", "gas-engineer",
    "drain-specialist", "glazier", "roofer", "builder",
    "water-restoration", "breakdown", "hvac"
]

SOCIAL_DOMAINS = {
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'linkedin': 'linkedin.com',
    'twitter': ['twitter.com', 'x.com'],
    'tiktok': 'tiktok.com'
}

from ddgs import DDGS
import phonenumbers

# --- Supabase Setup ---
env_files = ['.env', '.env.local', '.env.uk.local', '../.env', '../.env.local', '../.env.uk.local']
supabase_url = None
supabase_key = None

for env_path in env_files:
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            env_content = f.read()
            url_match = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content)
            key_match = re.search(r'SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s]+)', env_content)
            if not key_match:
                key_match = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', env_content)

            if url_match and not supabase_url: supabase_url = url_match.group(1).strip().strip("'").strip('"')
            if key_match and not supabase_key: supabase_key = key_match.group(1).strip().strip("'").strip('"')

if not supabase_url or not supabase_key:
    print("Error: Required credentials not found (Supabase)")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# Read-only headers (no Prefer header — avoids 204 empty body on GET)
read_headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
    "Content-Type": "application/json",
}

def get_uk_cities():
    cities = []
    file_path = os.path.join('..', 'src', 'lib', 'cityPostcodes.ts')
    if not os.path.exists(file_path):
        file_path = os.path.join('src', 'lib', 'cityPostcodes.ts')
    
    try:
        with open(file_path, 'r') as f:
            for line in f:
                match = re.search(r'"([^"]+)":\s*"[^"]+"', line)
                if match:
                    cities.append(match.group(1))
    except Exception as e:
        print(f"Failed to read cityPostcodes.ts: {e}")
    return cities

def to_uuid(s):
    h = hashlib.md5(s.encode('utf-8')).hexdigest()
    return f"{h[:8]}-{h[8:12]}-3{h[13:16]}-{format((int(h[16], 16) & 0x3) | 0x8, 'x')}{h[17:20]}-{h[20:]}"

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
        'secondary_links': []
    }

    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        found_data['email'] = email_match.group(0)
    else:
        mailto = soup.select_one('a[href^="mailto:"]')
        if mailto:
            found_data['email'] = mailto['href'].replace('mailto:', '').split('?')[0]

    for link in soup.find_all('a', href=True):
        href = link['href']
        try:
            full_url = urljoin(base_url, href)
        except:
            continue
        
        lower_url = full_url.lower()
        lower_text = link.get_text().lower()

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
        
        if not is_social and base_url in full_url:
            if any(k in lower_url or k in lower_text for k in ['contact', 'about', 'connect', 'touch']):
                if full_url not in found_data['secondary_links']:
                     found_data['secondary_links'].append(full_url)

    # 3. Find phone number
    try:
        for match in phonenumbers.PhoneNumberMatcher(text, "GB"):
            phone = phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.NATIONAL)
            if 'phone' not in found_data:
                found_data['phone'] = phone
    except Exception as e:
        pass
    
    if 'phone' not in found_data:
        # Fallback regex for UK phone numbers
        phone_match = re.search(r'(?:0|\+44)[1-9]\d{2,3}\s?\d{3,4}\s?\d{3,4}', text)
        if phone_match:
            found_data['phone'] = phone_match.group(0)

    return found_data

def scrape_website(website):
    if not website:
        return None, None
    if not website.startswith('http'):
        website = 'https://' + website
    
    try:
        resp = requests.get(website, headers={'User-Agent': USER_AGENT}, timeout=8)
        if resp.status_code == 200:
            extracted = extract_socials_and_email(resp.text, website)
            
            new_email = extracted['email']
            new_socials = extracted['social_links']
            
            has_all_socials = any(new_socials.values())
            
            if (not new_email or not has_all_socials) and extracted['secondary_links']:
                for sub_url in extracted['secondary_links'][:MAX_SECONDARY_PAGES]:
                    try:
                        sub_resp = requests.get(sub_url, headers={'User-Agent': USER_AGENT}, timeout=5)
                        if sub_resp.status_code == 200:
                            sub_extracted = extract_socials_and_email(sub_resp.text, sub_url)
                            if not new_email and sub_extracted['email']:
                                new_email = sub_extracted['email']
                            for p, url in sub_extracted['social_links'].items():
                                if url and not new_socials[p]:
                                    new_socials[p] = url
                    except:
                        pass
                        
            return new_email, new_socials
    except Exception as e:
        print(f"Scrape failed for {website}: {e}")
    return None, None

def search_places(query, location):
    """Fast path: DDGS search returning up to 15 candidate URLs per query."""
    results = []
    try:
        results = list(DDGS().text(f"emergency {query} {location} UK", max_results=15))
    except Exception as e:
        print(f"DDGS Primary Search failed: {e}")
    if not results:
        try:
            # Broader fallback — drops 'emergency' to widen net
            results = list(DDGS().text(f"{query} {location} UK phone number", max_results=15))
        except Exception as e:
            print(f"DDGS Fallback Search failed: {e}")
    return results

def google_maps_search(trade, city):
    """
    Fallback: headless Google Maps search.
    Used only when DDGS finds no result with a phone number.
    Returns a dict with name, phone, website or None.
    """
    try:
        from playwright.sync_api import sync_playwright
        import urllib.parse as _up
        query = f"emergency {trade} {city} UK"
        maps_url = f"https://www.google.com/maps/search/{_up.quote(query)}"
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page()
            page.set_extra_http_headers({"Accept-Language": "en-GB,en;q=0.9"})
            page.goto(maps_url, timeout=20000)
            page.wait_for_timeout(3000)

            # Click first result card
            first = page.query_selector('[role="article"]')
            if not first:
                browser.close()
                return None
            first.click()
            page.wait_for_timeout(2500)

            # Extract name
            name_el = page.query_selector('h1')
            name = name_el.inner_text().strip() if name_el else ""

            # Extract phone — Google Maps renders it as a data-item-id="phone:tel:..."
            phone = None
            phone_el = page.query_selector('[data-item-id^="phone:tel:"]')
            if phone_el:
                raw = phone_el.get_attribute("data-item-id") or ""
                phone = raw.replace("phone:tel:", "").strip()
            if not phone:
                # Try aria-label fallback
                phone_link = page.query_selector('a[href^="tel:"]')
                if phone_link:
                    href = phone_link.get_attribute("href") or ""
                    phone = href.replace("tel:", "").strip()

            # Extract website
            website = None
            web_el = page.query_selector('a[data-item-id="authority"]')
            if web_el:
                website = web_el.get_attribute("href")

            browser.close()

            if name and phone:
                print(f"    [Google Maps] Found: {name} | {phone}")
                return {"name": name, "phone": phone, "website": website}
    except Exception as e:
        print(f"    [Google Maps] Failed: {e}")
    return None

def process_gap(city, trade):
    # Check if a listing already exists
    query_url = f"{supabase_url}/rest/v1/businesses?city=eq.{requests.utils.quote(city)}&trade=eq.{trade}&country_code=eq.GB&select=id&limit=1"
    resp = requests.get(query_url, headers=read_headers)
    
    if resp.status_code == 200 and len(resp.json()) > 0:
        return False # No gap
    
    print(f"\n[GAP FOUND] {trade} in {city} - Finding listing...")
    
    places = search_places(trade.replace('-', ' '), city)
    # Domains that are NOT real business websites
    SKIP_DOMAINS = [
        'yelp.co.uk', 'yelp.com', 'checkatrade.com', 'trustatrader.com', 'yell.com',
        'wikipedia.org', 'britannica.com', 'facebook.com', 'linkedin.com',
        'indeed.com', 'glassdoor.com', 'mybuilder.com', 'ratedpeople.com',
        'quotatis.co.uk', 'bark.com', 'taskrabbit.com', 'tradesman.freeindex.co.uk',
        'amazon.co.uk', 'amazon.com', 'gov.uk', 'nhs.uk', 'bbc.co.uk'
    ]

    for place in places:
        time.sleep(DELAY_BETWEEN_REQUESTS)
        
        website = place.get('href')
        if not website or any(d in website.lower() for d in SKIP_DOMAINS):
            continue # Skip non-business sites
            
        print(f"    Scraping actual website: {website}")
        email, socials = None, None
        
        # We need to extract the phone number too since DDGS just gives the URL
        phone = None
        try:
            resp = requests.get(website, headers={'User-Agent': USER_AGENT}, timeout=8)
            if resp.status_code == 200:
                extracted = extract_socials_and_email(resp.text, website)
                email = extracted.get('email')
                socials = extracted.get('social_links')
                phone = extracted.get('phone')
                
                if (not email or not phone) and extracted.get('secondary_links'):
                    for sub_url in extracted['secondary_links'][:MAX_SECONDARY_PAGES]:
                        try:
                            sub_resp = requests.get(sub_url, headers={'User-Agent': USER_AGENT}, timeout=5)
                            if sub_resp.status_code == 200:
                                sub_extracted = extract_socials_and_email(sub_resp.text, sub_url)
                                if not email and sub_extracted.get('email'):
                                    email = sub_extracted['email']
                                if not phone and sub_extracted.get('phone'):
                                    phone = sub_extracted['phone']
                                for p, url in sub_extracted.get('social_links', {}).items():
                                    if url and not socials.get(p):
                                        socials[p] = url
                        except:
                            pass
        except Exception as e:
            print(f"    Failed to scrape {website}: {e}")
            continue

        if not phone:
            # Try to extract phone from DDGS snippet
            try:
                for match in phonenumbers.PhoneNumberMatcher(place.get('body', ''), "GB"):
                    phone = phonenumbers.format_number(match.number, phonenumbers.PhoneNumberFormat.NATIONAL)
                    break
            except:
                pass
            
            if not phone:
                phone_match = re.search(r'(?:0|\+44)[1-9]\d{2,3}\s?\d{3,4}\s?\d{3,4}', place.get('body', ''))
                if phone_match:
                    phone = phone_match.group(0)

        if not phone:
            continue  # Phone is always required — no phone, no listing

        title = place.get('title', '').split('|')[0].split('-')[0].strip()
        if insert_business(city, trade, title, phone, website, email, socials):
            return True

    # --- Tier 2: Google Maps fallback (used only when DDGS yields nothing with a phone) ---
    print(f"    [DDGS exhausted] Trying Google Maps for {trade} in {city}...")
    gm = google_maps_search(trade.replace('-', ' '), city)
    if gm and gm.get('phone'):
        return insert_business(city, trade, gm['name'], gm['phone'], gm.get('website'), None, None)

    print(f"    [NO RESULT] Could not find a verified listing for {trade} in {city}")
    return False

def insert_business(city, trade, title, phone, website, email, socials):
    """Insert a verified business into Supabase. Phone is mandatory."""
    if not phone or not title:
        return False
    unique_id = f"ddgs-{title}-{city}"
    uuid_str = to_uuid(unique_id)
    base_slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    slug = f"{base_slug}-{uuid_str[:8]}"
    business_data = {
        'id': uuid_str, 'slug': slug, 'name': title, 'trade': trade, 'city': city,
        'address': f"{city}, UK", 'phone': phone, 'website': website, 'email': email,
        'social_links': socials if socials and any(socials.values()) else None,
        'rating': 5.0, 'review_count': 0, 'hours': '24/7 Emergency Service',
        'is_open_24_hours': True, 'verified': True, 'tier': 'free',
        'country_code': 'GB', 'priority_score': 0
    }
    upsert_url = f"{supabase_url}/rest/v1/businesses"
    headers_upsert = headers.copy()
    headers_upsert['Prefer'] = 'resolution=merge-duplicates'
    insert_resp = requests.post(upsert_url, headers=headers_upsert, json=business_data)
    if insert_resp.status_code in [201, 200, 204]:
        print(f"    [+] Inserted: {title} | {phone} (Email: {'Yes' if email else 'No'})")
        return True
    else:
        print(f"    [-] Failed to insert: {insert_resp.text}")
        return False


def get_trade_gaps(all_cities):
    """Find every (city, trade) combo with zero listings — the actual gaps to fill."""
    gaps = []
    total = len(all_cities) * len(STANDARD_TRADES)
    checked = 0
    for city in all_cities:
        for trade in STANDARD_TRADES:
            r = requests.get(
                f"{supabase_url}/rest/v1/businesses",
                params={'city': f'eq.{city}', 'trade': f'eq.{trade}',
                        'country_code': 'eq.GB', 'select': 'id', 'limit': '1'},
                headers=read_headers
            )
            if r.status_code == 200 and len(r.json()) == 0:
                gaps.append((city, trade))
            checked += 1
            if checked % 500 == 0:
                print(f"    Scanned {checked}/{total}... {len(gaps)} gaps so far")
    return gaps

def main():
    print("[*] Starting UK Listing Orchestrator (Continuous Gap Fill + Enrichment)")
    cities = get_uk_cities()
    print(f"Loaded {len(cities)} UK locations.")

    # --- Priority Pass: find every city+trade gap and fill it first ---
    print(f"\n[*] Priority Pass: scanning all {len(cities) * len(STANDARD_TRADES)} city+trade combos for gaps...")
    gaps = get_trade_gaps(cities)
    print(f"[*] Found {len(gaps)} gaps. Filling now...")
    for city, trade in gaps:
        process_gap(city, trade)
        time.sleep(DELAY_BETWEEN_REQUESTS)
    print("[*] Priority Pass complete. Starting continuous maintenance loop...")

    # --- Continuous loop: keep enriching and catching any new gaps ---
    while True:
        for city in cities:
            for trade in STANDARD_TRADES:
                process_gap(city, trade)
                time.sleep(DELAY_BETWEEN_REQUESTS)
        print("\n[*] Full scan complete. Restarting loop...")
        time.sleep(10)

if __name__ == "__main__":
    main()

