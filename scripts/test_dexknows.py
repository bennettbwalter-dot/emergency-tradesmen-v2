import requests
from bs4 import BeautifulSoup
import re

def test_dexknows(trade, city, state):
    trade_query = trade.replace("-", "+")
    location_query = f"{city}, {state}".replace(" ", "+").replace(",", "%2C")
    url = f"https://www.dexknows.com/search?q={trade_query}&l={location_query}"
    
    print(f"TESTING DEXKNOWS: {url}")
    headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
    
    try:
        resp = requests.get(url, headers=headers, timeout=15)
        print(f"STATUS CODE: {resp.status_code}")
        
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, 'html.parser')
            # DexKnows result cards often have class 'organic-res' or similar
            results = soup.select('.result') or soup.select('.organic')
            print(f"POTENTIAL CARDS: {len(results)}")
            
            if len(results) == 0:
                print("DUMPING SNIPPET OF HTML:")
                print(resp.text[:500])

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_dexknows("plumber", "New York", "NY")
