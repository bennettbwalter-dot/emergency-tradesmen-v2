import os
import requests
import re
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("HERE_API_KEY")

def test_here_api(trade, city, state):
    print(f"TESTING HERE API for {trade} in {city}, {state}")
    
    # 1. Geocode
    geo_url = "https://geocode.search.hereapi.com/v1/geocode"
    geo_params = {
        "q": f"{city}, {state}, USA",
        "apiKey": api_key
    }
    
    try:
        geo_resp = requests.get(geo_url, params=geo_params, timeout=10)
        if geo_resp.status_code != 200:
            print(f"GEOCODE ERROR: {geo_resp.status_code}")
            return
        
        items = geo_resp.json().get("items", [])
        if not items:
            print("NO LOCATION FOUND")
            return
        
        pos = items[0]['position']
        lat, lng = pos['lat'], pos['lng']
        print(f"FOUND COORDS: {lat}, {lng}")
        
        # 2. Discover
        disc_url = "https://discover.search.hereapi.com/v1/discover"
        disc_params = {
            "at": f"{lat},{lng}",
            "q": trade.replace("-", " "),
            "limit": 10,
            "apiKey": api_key
        }
        
        disc_resp = requests.get(disc_url, params=disc_params, timeout=10)
        print(f"DISCOVER STATUS: {disc_resp.status_code}")
        
        if disc_resp.status_code == 200:
            found = []
            for item in disc_resp.json().get("items", []):
                # Extract contacts
                contacts = item.get("contacts", [])
                phone = None
                for c in contacts:
                    for p in c.get("phone", []):
                        raw_phone = re.sub(r'[^\d]', '', p.get("value", ""))
                        if len(raw_phone) == 11 and raw_phone.startswith('1'): raw_phone = raw_phone[1:]
                        if len(raw_phone) == 10:
                            phone = raw_phone
                            break
                    if phone: break
                
                if phone:
                    print(f"  FOUND: {item['title']} - {phone}")
                    found.append(item)
            
            print(f"TOTAL VALID FOUND: {len(found)}")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_here_api("plumber", "New York", "NY")
