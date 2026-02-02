import os
import re
import time
import requests
import json
from datetime import datetime
from typing import Dict, List
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
from supabase import create_client
from dotenv import load_dotenv

load_dotenv(r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env')

# Supabase Setup
URL = os.getenv("VITE_SUPABASE_URL")
KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
sb = create_client(URL, KEY)

SOCIAL_DOMAINS = {
    'facebook': 'facebook.com',
    'instagram': 'instagram.com',
    'linkedin': 'linkedin.com',
    'twitter': ['twitter.com', 'x.com'],
    'tiktok': 'tiktok.com'
}

class EnrichmentAgent:
    def __init__(self):
        self.headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}

    def scrape_website(self, url: str) -> Dict:
        if not url or 'yelp.com' in url or 'google.com' in url or 'emergencytradesmen.net' in url: return {}
        if not url.startswith('http'): url = 'https://' + url
        
        try:
            resp = requests.get(url, headers=self.headers, timeout=10)
            if resp.status_code != 200: return {}
            
            soup = BeautifulSoup(resp.text, 'html.parser')
            text = soup.get_text()
            
            found = {
                'email': None,
                'social_links': {}
            }
            
            # Email pattern
            email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            if email_match:
                email = email_match.group(0).lower()
                if not any(x in email for x in ['example.com', 'sentry.io', 'wixpress.com']):
                    found['email'] = email
            
            # Social links
            for link in soup.find_all('a', href=True):
                href = link['href']
                try:
                    full_url = urljoin(url, href).lower()
                    for platform, domain in SOCIAL_DOMAINS.items():
                        domains = [domain] if isinstance(domain, str) else domain
                        if any(d in full_url for d in domains):
                            if 'share' not in full_url and 'sharer' not in full_url:
                                found['social_links'][platform] = full_url
                except: continue
                
            return found
        except: return {}

    def calculate_trust_score(self, biz: Dict) -> int:
        score = 1 # Real service business
        if biz.get('website'): score += 1
        if biz.get('email'): score += 1
        if biz.get('social_links') and any(biz['social_links'].values()): score += 1
        if biz.get('rating') and float(biz['rating']) > 0: score += 1
        return score

    def process_business(self, biz: Dict):
        print(f"[PROCESS] {biz['name']} ({biz['id']})")
        
        current_email = biz.get('email')
        current_socials = biz.get('social_links') or {}
        website = biz.get('website')
        
        needs_scrape = not current_email or not current_socials
        
        scraped = {}
        if needs_scrape and website:
            print(f"  [SCRAPE] Visiting {website}...")
            scraped = self.scrape_website(website)
        
        # Merge data
        final_email = current_email or scraped.get('email')
        final_socials = {**current_socials, **scraped.get('social_links', {})}
        
        biz_for_score = {
            'website': website,
            'email': final_email,
            'social_links': final_socials,
            'rating': biz.get('rating')
        }
        
        trust_score = self.calculate_trust_score(biz_for_score)
        
        # Update Supabase
        try:
            update_data = {
                'trust_score': trust_score,
                'social_links': final_socials
            }
            if final_email and not current_email:
                update_data['email'] = final_email
                
            sb.table('businesses').update(update_data).eq('id', biz['id']).execute()
            print(f"  [OK] Saved Score: {trust_score}")
        except Exception as e:
            print(f"  [ERROR] Failed to update: {e}")

    def run(self):
        print("[INIT] Starting Retroactive USA Enrichment...")
        
        # Process in batches, ordering by updated_at ASC
        # As we update records, they will move to the end of the queue
        batch_size = 50
        
        while True:
            print(f"\n[BATCH] Fetching next {batch_size} oldest records...")
            # We use offset 0 because updated records naturally fall to the end of an ASC sort if we touch updated_at
            # Actually, ordered by updated_at ASC, the most recently updated are at the END.
            # So the ones at the START are the ones that haven't been processed yet.
            res = sb.table('businesses').select('*').eq('country_code', 'US').order('updated_at', desc=False).limit(batch_size).execute()
            
            if not res.data:
                print("[DONE] No more businesses to process.")
                break
                
            with ThreadPoolExecutor(max_workers=3) as executor:
                executor.map(self.process_business, res.data)
            
            time.sleep(1) # Breath

if __name__ == "__main__":
    EnrichmentAgent().run()
