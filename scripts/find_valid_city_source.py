import urllib.request
import json
import csv
import io

urls = [
    ("grammakov_json_main", "https://raw.githubusercontent.com/grammakov/USA-cities-and-states/main/us_cities_states_counties.json"),
    ("grammakov_json_master", "https://raw.githubusercontent.com/grammakov/USA-cities-and-states/master/us_cities_states_counties.json"),
    ("kelvins_csv_master", "https://raw.githubusercontent.com/kelvins/US-Cities-Database/master/US-Cities-Database.csv"),
    ("kelvins_csv_main", "https://raw.githubusercontent.com/kelvins/US-Cities-Database/main/US-Cities-Database.csv"),
    ("simplemaps_csv", "https://simplemaps.com/static/data/us-cities/uscities.csv") 
]

for name, url in urls:
    try:
        print(f"Checking {name} at {url}...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8', errors='ignore')
            
            if url.endswith('.json'):
                data = json.loads(content)
                count = 0
                if isinstance(data, dict):
                    # Grammakov style: State -> County? -> List
                    # Or State -> List
                    for k, v in data.items():
                        if isinstance(v, list): count += len(v) # Direct list
                        elif isinstance(v, dict): # State -> County
                             for c, cities in v.items():
                                 if isinstance(cities, list): count += len(cities)
                print(f"SUCCESS: {name} found {count} items.")
                if count > 5000:
                    print(f"SELECTED: {url}")
                    break
            else:
                # CSV
                lines = content.splitlines()
                count = len(lines) - 1 # header
                print(f"SUCCESS: {name} found {count} lines.")
                if count > 5000:
                    print(f"SELECTED: {url}")
                    break

    except Exception as e:
        print(f"FAILED {name}: {e}")
