import requests
from bs4 import BeautifulSoup
import re

def debug_scraper(trade, city, state):
    trade_query = trade.replace("-", " ")
    location_query = f"{city}, {state}"
    url = f"https://www.yellowpages.com/search?search_terms={trade_query}&geo_location_terms={location_query}"
    
    print(f"DEBUGGING URL: {url}")
    headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        print(f"STATUS CODE: {resp.status_code}")
        
        soup = BeautifulSoup(resp.text, 'html.parser')
        
        # Check if we even found result cards
        results = soup.select('.result')
        print(f"CARDS FOUND: {len(results)}")
        
        for i, card in enumerate(results[:3]):
            print(f"\nCARD {i+1}:")
            name_tag = card.select_one('.business-name')
            phone_tag = card.select_one('.phones')
            addr_tag = card.select_one('.adr')
            
            print(f"  NAME_TAG: {name_tag is not None}")
            print(f"  PHONE_TAG: {phone_tag is not None}")
            if name_tag: print(f"  NAME: {name_tag.get_text(strip=True)}")
            if phone_tag: print(f"  PHONE: {phone_tag.get_text(strip=True)}")
            if addr_tag: print(f"  ADDR: {addr_tag.get_text(strip=True)}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    debug_scraper("plumber", "New York", "NY")
