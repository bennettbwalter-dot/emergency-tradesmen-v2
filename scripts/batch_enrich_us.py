#!/usr/bin/env python3
"""
DEEP ENRICHMENT SCRIPT - US BUSINESSES
=======================================
Deeply crawls websites to find email addresses.
- Scrapes homepage
- If no email found, crawls subpages (Contact, About, etc.)
- Scans specifically for mailto: links
- Updates trust_score (1-5 basis)
"""
import os
import re
import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from supabase import create_client
from dotenv import load_dotenv

# Load environment
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

sb = create_client(os.environ['VITE_SUPABASE_URL'], os.environ['VITE_SUPABASE_ANON_KEY'])

# Social domains to detect
SOCIAL_DOMAINS = {
    'facebook': ['facebook.com', 'fb.com'],
    'instagram': ['instagram.com'],
    'linkedin': ['linkedin.com'],
    'twitter': ['twitter.com', 'x.com'],
    'tiktok': ['tiktok.com']
}

EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
CONTACT_KEYWORDS = ['contact', 'about', 'reach', 'touch', 'support', 'connect']

def find_emails(text, soup=None):
    """Finds emails in text and in soup (including mailto: links)"""
    emails = set()
    
    # 1. Regex on text
    found = re.findall(EMAIL_REGEX, text)
    for e in found:
        email = e.lower()
        if not any(x in email for x in ['example.com', 'sentry.io', 'wixpress.com', 'wordpress', 'schema.org', '.png', '.jpg', '.gif']):
            emails.add(email)
            
    # 2. mailto links in soup
    if soup:
        for a in soup.find_all('a', href=True):
            href = a['href'].lower()
            if href.startswith('mailto:'):
                email = href.replace('mailto:', '').split('?')[0].strip().lower()
                if re.match(EMAIL_REGEX, email):
                    emails.add(email)
                    
    return list(emails)

def scrape_page(url, headers):
    """Helper to fetch and parse a single page"""
    try:
        resp = requests.get(url, headers=headers, timeout=10)
        if resp.status_code != 200:
            return None, None
        soup = BeautifulSoup(resp.text, 'html.parser')
        return soup.get_text(), soup
    except:
        return None, None

def scrape_website_deep(url: str) -> dict:
    """Deeply scrapes a website for email and social links."""
    if not url:
        return {}
    if not url.startswith('http'):
        url = 'https://' + url
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    result = {'email': None, 'social_links': {}}
    
    # 1. Scrape Homepage
    text, soup = scrape_page(url, headers)
    if not text:
        return {}
        
    emails = find_emails(text, soup)
    if emails:
        result['email'] = emails[0]
        
    # Find Social Links on Homepage
    for link in soup.find_all('a', href=True):
        href = link['href'].strip().lower()
        if not href:
            continue
        
        for platform, domains in SOCIAL_DOMAINS.items():
            if any(d in href for d in domains):
                if 'share' in href or 'sharer' in href:
                    continue
                if not href.startswith('http') and not href.startswith('//'):
                    full_url = urljoin(url, href)
                else:
                    full_url = href if href.startswith('http') else 'https:' + href
                result['social_links'][platform] = full_url
                break
                
    # 2. Deep Crawl if no email found
    if not result['email']:
        contact_urls = set()
        base_domain = urlparse(url).netloc
        
        for a in soup.find_all('a', href=True):
            href = a['href'].strip().lower()
            link_text = a.get_text().lower()
            
            # Check if link looks like a contact page
            if any(kw in href for kw in CONTACT_KEYWORDS) or any(kw in link_text for kw in CONTACT_KEYWORDS):
                full_url = urljoin(url, href)
                # Ensure we stay on the same domain
                if urlparse(full_url).netloc == base_domain:
                    contact_urls.add(full_url)
                    
        # Visit top 3 likely contact pages
        for c_url in list(contact_urls)[:3]:
            c_text, c_soup = scrape_page(c_url, headers)
            if c_text:
                c_emails = find_emails(c_text, c_soup)
                if c_emails:
                    result['email'] = c_emails[0]
                    break
                    
    return result

def calculate_trust_score(biz: dict) -> int:
    """Trust Score (1-5): Base(1) + Email(+1) + Social(+1) + Website(+1) + Reviews(+1)"""
    score = 1
    if biz.get('email'):
        score += 1
    if biz.get('website'):
        score += 1
    if biz.get('review_count', 0) > 0 or (biz.get('rating') and biz.get('rating') > 0):
        score += 1
    if biz.get('social_links') and any(biz['social_links'].values()):
        score += 1
    return min(score, 5)

def enrich_business(biz: dict) -> dict:
    """Enriches a single business with deep scraped data."""
    biz_id = biz['id']
    website = biz.get('website')
    
    update_data = {}
    
    # We always re-scrape if email is missing or social links are sparse
    if website and (not biz.get('email') or not biz.get('social_links')):
        scraped = scrape_website_deep(website)
        
        if scraped.get('email'):
            update_data['email'] = scraped['email']
        
        existing_socials = biz.get('social_links') or {}
        if scraped.get('social_links'):
            merged = {**existing_socials, **scraped['social_links']}
            if merged != existing_socials:
                update_data['social_links'] = merged
    
    # Calculate trust score with new data
    enriched_biz = {**biz, **update_data}
    trust_score = calculate_trust_score(enriched_biz)
    update_data['trust_score'] = trust_score
    
    return {'id': biz_id, 'update': update_data}

def main():
    print("=" * 60)
    print("🔍 US BUSINESS DEEP ENRICHMENT - EMAIL HARVESTER")
    print("=" * 60)
    
    BATCH_SIZE = 500 # Smaller batches for deep scraping
    offset = 0
    total_found_emails = 0
    
    while True:
        print(f"\n[BATCH] Fetching offset {offset}...")
        res = sb.table('businesses').select('id, name, website, email, social_links, rating, review_count').eq('country_code', 'US').range(offset, offset + BATCH_SIZE - 1).execute()
        
        if not res.data:
            print("[DONE] No more businesses to process.")
            break
        
        batch = res.data
        print(f"  Deep processing {len(batch)} businesses...")
        
        updates = []
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(enrich_business, b): b for b in batch}
            for future in as_completed(futures):
                try:
                    result = future.result()
                    if result['update']:
                        updates.append(result)
                except:
                    pass
        
        # Update database and count newly found emails
        batch_new_emails = 0
        for item in updates:
            try:
                # Find the original biz in batch
                orig = next(b for b in batch if b['id'] == item['id'])
                if not orig.get('email') and item['update'].get('email'):
                    batch_new_emails += 1
                
                sb.table('businesses').update(item['update']).eq('id', item['id']).execute()
            except:
                pass
        
        total_found_emails += batch_new_emails
        print(f"  ✅ Batch update complete. New emails found: {batch_new_emails}")
        print(f"  🌟 Total new emails this session: {total_found_emails}")
        
        offset += BATCH_SIZE
        if len(batch) < BATCH_SIZE:
            break
    
    print("\n" + "=" * 60)
    print(f"✅ DEEP ENRICHMENT COMPLETE")
    print(f"   Total New Emails Found: {total_found_emails}")
    print("=" * 60)

if __name__ == "__main__":
    main()
