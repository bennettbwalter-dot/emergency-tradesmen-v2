import urllib.request
import json

url = "https://raw.githubusercontent.com/grammakov/USA-cities-and-states/master/us_cities_states_counties.json"

try:
    print(f"Fetching {url}...")
    with urllib.request.urlopen(url) as response:
        content = response.read().decode('utf-8')
        # This file structure might be different. Let's inspect a bit or just robustly parse.
        data = json.loads(content)
    
    total_cities = 0
    state_count = 0
    
    # Structure guess: { "State": ["City", "City"] } or similar?
    if isinstance(data, dict):
        state_count = len(data.keys())
        for k, v in data.items():
            if isinstance(v, list):
                total_cities += len(v)
            elif isinstance(v, dict):
                 # maybe state -> county -> list?
                 for county, cities in v.items():
                     if isinstance(cities, list):
                         total_cities += len(cities)
    
    print(f"States Found: {state_count}")
    print(f"Total Cities: {total_cities}")
    
except Exception as e:
    print(f"Error: {e}")
