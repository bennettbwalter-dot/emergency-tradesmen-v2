import requests
from bs4 import BeautifulSoup
import re
import time
import random

def debug_scraper_v2(trade, city, state):
    trade_query = trade.replace("-", " ")
    location_query = f"{city}, {state}"
    url = f"https://www.yellowpages.com/search?search_terms={trade_query}&geo_location_terms={location_query}"
    
    print(f"DEBUGGING URL: {url}")
    
    headers = {
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
    }
    
    session = requests.Session()
    session.headers.update(headers)
    
    try:
        # Try a landing page first to get cookies
        session.get("https://www.yellowpages.com/", timeout=10)
        time.sleep(random.uniform(1, 3))
        
        resp = session.get(url, timeout=15)
        print(f"STATUS CODE: {resp.status_code}")
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            results = soup.select('.result')
            print(f"CARDS FOUND: {len(results)}")
            
            for i, card in enumerate(results[:3]):
                name_tag = card.select_one('.business-name')
                phone_tag = card.select_one('.phones')
                if name_tag and phone_tag:
                    print(f"  FOUND: {name_tag.get_text(strip=True)} - {phone_tag.get_text(strip=True)}")
        else:
            print(f"RESPONSE TEXT START: {resp.text[:200]}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    debug_scraper_v2("plumber", "New York", "NY")
