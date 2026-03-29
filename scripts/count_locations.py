import json
import os

def count_locations():
    file_path = os.path.join(os.getcwd(), 'src', 'lib', 'us_cities.json')
    
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    states_count = 0
    metros_count = 0
    cities_count = 0
    suburbs_count = 0

    states = data.get('states', [])
    states_count = len(states)

    for state in states:
        metros = state.get('metros', [])
        metros_count += len(metros)
        for metro in metros:
            cities = metro.get('cities', [])
            cities_count += len(cities)
            for city in cities:
                suburbs = city.get('suburbs', [])
                suburbs_count += len(suburbs)

    total_locations = states_count + metros_count + cities_count + suburbs_count

    print(f"--- US Location Coverage Report ---")
    print(f"States: {states_count}")
    print(f"Metros: {metros_count}")
    print(f"Core Cities: {cities_count}")
    print(f"Suburbs/Towns: {suburbs_count}")
    print(f"-----------------------------------")
    print(f"TOTAL NAMED LOCATIONS: {total_locations}")

if __name__ == "__main__":
    count_locations()
