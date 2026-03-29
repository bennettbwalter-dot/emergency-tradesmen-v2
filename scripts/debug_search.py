import os
import json
import re
import cloudscraper
import requests
from bs4 import BeautifulSoup
import random

def test_source(name, url_fn, trade, city, state):
    print(f"Checking {name}: {trade} in {city}, {state}")
    scraper = cloudscraper.create_scraper()
    resp = scraper.get(url_fn(trade, city, state))
    print(f"{name} status: {resp.status_code}")
    if resp.status_code == 200:
        print(f"{name} found content length: {len(resp.text)}")
        open(f"debug_{name}.html", "w", encoding='utf-8').write(resp.text)
    return resp.status_code

if __name__ == "__main__":
    def yp_url(t, c, s): return f"https://www.yellowpages.com/search?search_terms={t}&geo_location_terms={c}%2C+{s}"
    def yelp_url(t, c, s): return f"https://www.yelp.com/search?find_desc={t}&find_loc={c}%2C+{s}"
    def manta_url(t, c, s): return f"https://www.manta.com/search?search={t}&search_location={c}%2C+{s}"
    
    test_source("YP", yp_url, "plumber", "Savannah", "GA")
    test_source("Yelp", yelp_url, "plumber", "Savannah", "GA")
    test_source("Manta", manta_url, "plumber", "Savannah", "GA")
