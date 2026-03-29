
import requests
import json

def check_city(city, country):
    query = f"{city}, {country}"
    url = f"https://nominatim.openstreetmap.org/search?format=json&q={query}&limit=1"
    headers = {
        'User-Agent': 'EmergencyTradesmenTest/1.0'
    }
    
    print(f"Fetching: {url}")
    try:
        response = requests.get(url, headers=headers)
        data = response.json()
        
        if data and len(data) > 0:
            print(f"Success! Found coordinates for {city}:")
            print(f"Lat: {data[0]['lat']}, Lon: {data[0]['lon']}")
            print(f"DisplayName: {data[0]['display_name']}")
        else:
            print(f"No results found for {city}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_city("Watford", "UK")
