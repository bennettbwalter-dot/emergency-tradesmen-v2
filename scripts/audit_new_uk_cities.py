
import os
from supabase import create_client, Client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith("VITE_SUPABASE_URL="):
                url = line.split('=', 1)[1].strip()
            elif line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

new_cities = [
    "Blackburn", "St Helens", "Bury", "Southport", "West Bromwich", "Taunton", "Yeovil",
    "Weston-super-Mare", "Barnstaple", "Newquay", "Dover", "Folkestone", "Great Yarmouth",
    "King's Lynn", "Corby", "Redcar", "Tynemouth", "Washington", "Altrincham", "Skelmersdale",
    "Morecambe", "Kendal", "Penrith", "Dumfries", "Falkirk", "Kilmarnock", "Motherwell",
    "Coatbridge", "Clydebank", "Greenock", "Glenrothes", "Llandudno", "Rhyl", "Caerphilly",
    "Bridgend", "Merthyr Tydfil", "Cwmbran", "Barry", "Llanelli", "Neath", "Port Talbot",
    "Newry", "Armagh", "Coleraine", "Londonderry", "Omagh", "Enniskillen", "Lancashire",
    "Yorkshire", "Kent", "Essex", "Surrey", "Sussex", "Hampshire", "Cornwall", "Devon",
    "Somerset", "Dorset", "Wiltshire", "Berkshire", "Oxfordshire", "Buckinghamshire",
    "Hertfordshire", "Bedfordshire", "Cambridgeshire", "Norfolk", "Suffolk", "Lincolnshire",
    "Nottinghamshire", "Derbyshire", "Leicestershire", "Northamptonshire", "Warwickshire",
    "Worcestershire", "Gloucestershire", "Herefordshire", "Shropshire", "Staffordshire",
    "Cheshire", "Northumberland", "Cumbria"
]

print(f"Auditing {len(new_cities)} new locations for existing data...")

found_count = 0
for city in new_cities:
    # Case insensitive search usually required, but let's try direct match first
    res = supabase.table('businesses').select('*', count='exact').eq('city', city).execute()
    count = res.count
    if count and count > 0:
        print(f"  [FOUND] {city}: {count} listings")
        found_count += 1
    # Check Counties in 'state' or 'city' field?
    # Some listings might have specific cities but belong to the county.
    # But here we are checking if the LOCATION name itself has listings.

print(f"Total verified cities with data: {found_count}")
