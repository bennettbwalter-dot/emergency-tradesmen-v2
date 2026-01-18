
import os
import json
from supabase import create_client, Client
from dotenv import load_dotenv



# --- Configuration ---
# --- Configuration ---
# improved .env loading
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"Loaded .env from: {env_path}")
else:
    load_dotenv() # Fallback to default
    print("Loaded .env from default location")

# DEBUG: Print all env vars related to Supabase
# print("Debug Env Vars:")
# for k, v in os.environ.items():
#     if "SUPABASE" in k or "VITE_" in k:
#         try:
#             print(f"  {k}: {'*' * 10} (Len: {len(v)})")
#         except:
#             pass

# Handle potential BOM in .env key or fallback
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
if not SUPABASE_URL:
    # Try with BOM if python-dotenv didn't strip it but loaded it as a key
    SUPABASE_URL = os.environ.get("\ufeffVITE_SUPABASE_URL")

if not SUPABASE_URL:
    print("⚠️  Using hardcoded fallback for Supabase URL")
    SUPABASE_URL = "https://xwqvhymkwuasotsgmarn.supabase.co"

SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
    print(f"❌ Missing Supabase credentials. URL: {bool(SUPABASE_URL)}, KEY: {bool(SUPABASE_KEY)}")
    # Debug what keys ARE present
    # print(f"Env keys: {list(os.environ.keys())}")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# --- Source of Truth: UK Cities (from cityPostcodes.ts) ---
# Copied and adapted from src/lib/cityPostcodes.ts
UK_CITIES = [
    # Major Cities
    "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Bradford", 
    "Liverpool", "Edinburgh", "Bristol", "Cardiff", "Coventry", "Nottingham", "Leicester", 
    "Sunderland", "Belfast", "Newcastle upon Tyne", "Newcastle-upon-Tyne", "Brighton", 
    "Brighton & Hove", "Hull", "Plymouth", "Stoke-on-Trent", "Wolverhampton", "Derby", 
    "Swansea", "Southampton", "Salford", "Aberdeen", "Portsmouth", "York", "Peterborough", 
    "Dundee", "Oxford", "Cambridge", "Norwich", "Exeter",
    
    # Large Towns & Cities
    "Luton", "Milton Keynes", "Northampton", "Bournemouth", "Reading", "Blackpool", "Preston", 
    "Huddersfield", "Slough", "Swindon", "Bolton", "Oldham", "Rochdale", "Doncaster", "Bedford", 
    "Ipswich", "Cheltenham", "Gloucester", "Worcester", "Hereford", "Shrewsbury", "Telford", 
    "Canterbury", "Carlisle", "Chelmsford", "Chester", "Colchester", "Durham", "Lancaster", 
    "Lincoln", "Southend-on-Sea", "St Albans", "Truro", "Wakefield", "Winchester", "Westminster", 
    "Warrington", "Wigan", "Middlesbrough", "Barnsley", "Newport", "Poole", "Stockport", 
    "Basildon", "Maidstone", "Crawley", "Worthing", "Sutton Coldfield", "Dudley", "Walsall", 
    "Watford", "High Wycombe", "Harlow", "Stevenage", "Redditch", "Chesterfield", "Mansfield", 
    "Beeston", "Loughborough", "Burton upon Trent", "Crewe", "Macclesfield", "Scunthorpe", 
    "Grimsby", "Harrogate", "Halifax", "Batley", "Keighley", "South Shields", "Gateshead", 
    "Darlington", "Hartlepool", "Stockton-on-Tees", "Hemel Hempstead", "Gillingham", "Eastbourne", 
    "Rayleigh", "Lowestoft", "Woking", "Maidenhead", "Basingstoke", "Fareham", "Gosport", "Ewell", 
    "Crosby", "Paignton", "Torquay", "Bebington", "Halesowen", "Kidderminster", "Rugby", 
    "Leamington Spa", "Kettering", "Wellingborough", "Dunstable", "Aylesbury", "Cheshunt", 
    "Welwyn Garden City", "Margate", "Royal Tunbridge Wells", "Ashford", "Braintree", 
    "Canvey Island", "Clacton-on-Sea", "Sittingbourne", "Gravesend", "Dartford", "Weymouth", 
    "Falmouth", "St Austell", "Scarborough", "Bridlington", "Castleford", "Pontefract", 
    "Rotherham", "Sale", "Widnes", "Runcorn", "Ellesmere Port", "Birkenhead", "Wallasey", 
    "Barrow-in-Furness", "Workington", "Whitehaven", "Chorley", "Accrington", "Burnley", 
    "Lytham St Annes", "Stafford", "Bromsgrove", "Grantham", "Ely", "Lichfield", "Ripon", 
    "Salisbury", "Wells", "Solihull", "Guildford", "Staines", "Chatham", "Hastings", "Nuneaton", 
    "Tamworth", "Cannock", "Bath",

    # London Boroughs & Districts
    "Brixton", "Hackney", "Camden", "Islington", "Greenwich", "Chelsea", "Wembley", "Croydon", 
    "Ealing", "Enfield", "Harrow", "Hounslow", "Kingston", "Merton", "Newham", "Redbridge", 
    "Richmond", "Southwark", "Tower Hamlets", "Waltham Forest", "Wandsworth", "Woolwich", "Fulham",

    # Northern Ireland
    "Derry", "Lisburn", "Bangor",

    # Scotland Additional
    "Inverness", "Perth", "Stirling", "Paisley", "East Kilbride", "Livingston", "Hamilton", 
    "Cumbernauld", "Dunfermline", "Kirkcaldy", "Ayr",

    # Wales Additional
    "Wrexham", "Newport (Wales)", "Bangor (Wales)", "St Asaph", "St Davids",

    # Missing Major Towns (checked)
    "St Helens", "Bury", "Southport", "West Bromwich", "Taunton", "Yeovil", "Weston-super-Mare", 
    "Barnstaple", "Newquay", "Dover", "Folkestone", "Great Yarmouth", "King's Lynn", "Corby", 
    "Redcar", "Tynemouth", "Washington", "Altrincham", "Skelmersdale", "Morecambe", "Kendal", 
    "Penrith", "Dumfries", "Falkirk", "Kilmarnock", "Motherwell", "Coatbridge", "Clydebank", 
    "Greenock", "Glenrothes", "Llandudno", "Rhyl", "Caerphilly", "Bridgend", "Merthyr Tydfil", 
    "Cwmbran", "Barry", "Llanelli", "Neath", "Port Talbot", "Newry", "Armagh", "Coleraine", 
    "Londonderry", "Omagh", "Enniskillen"
]

# Trade List from src/lib/trades.ts
TRADES = [
    "plumber", 
    "electrician", 
    "locksmith", 
    "gas-engineer", 
    "drain-specialist", 
    "glazier", 
    "roofer", 
    "builder", 
    "water-restoration", 
    "breakdown", 
    "hvac"
]


def main():
    print("STARTING UK LISTING AUDIT")
    print("--------------------------------------------------")
    print(f"Target Cities: {len(UK_CITIES)}")
    print(f"Target Trades: {len(TRADES)}")
    
    # 1. Fetch all UK businesses
    # Note: Fetching all might be large, but for UK specific it should be manageable (<50k rows usually?)
    # If fails due to size, might need pagination or filtering by city. 
    # Let's try fetching just ID, city, trade, phone for efficiency.
    
    print("\nFetching UK businesses from Supabase...", end="", flush=True)
    all_rows = []
    
    # Simple pagination loop
    offset = 0
    batch_size = 1000
    while True:
        res = supabase.table("businesses").select("id, city, trade, name").eq("country_code", "GB").range(offset, offset + batch_size - 1).execute()
        rows = res.data
        if not rows:
            break
        all_rows.extend(rows)
        offset += batch_size
        print(".", end="", flush=True)
        
    print(f"\nTotal UK Businesses Found: {len(all_rows)}")
    
    # 2. Process Data
    # Map: City -> Trade -> Count
    city_trade_counts = {}
    
    # Also track locations found in DB that are NOT in our target list
    unknown_locations = set()
    
    # Normalize our target list for matching
    target_cities_normalized = {c.lower(): c for c in UK_CITIES}
    
    for row in all_rows:
        city = row.get("city", "").strip()
        trade = row.get("trade", "").strip()
        
        if not city or not trade:
            continue
            
        city_norm = city.lower()
        
        # Check if it's a known city
        if city_norm in target_cities_normalized:
            real_city_name = target_cities_normalized[city_norm]
            
            if real_city_name not in city_trade_counts:
                city_trade_counts[real_city_name] = {}
            
            if trade not in city_trade_counts[real_city_name]:
                city_trade_counts[real_city_name][trade] = 0
                
            city_trade_counts[real_city_name][trade] += 1
        else:
            unknown_locations.add(city)

    # 3. Analyze Gaps
    complete_pages = 0
    incomplete_pages = 0
    gap_report = []
    
    target_listing_count = 5
    
    for city in UK_CITIES:
        for trade in TRADES:
            current_count = city_trade_counts.get(city, {}).get(trade, 0)
            
            if current_count >= target_listing_count:
                complete_pages += 1
            else:
                incomplete_pages += 1
                gap_report.append({
                    "city": city,
                    "trade": trade,
                    "current": current_count,
                    "needed": target_listing_count - current_count
                })

    # 4. Generate Report
    print("\nAUDIT SUMMARY")
    print("--------------------------------------------------")
    print(f"Total UK Listings:       {len(all_rows)}")
    print(f"Total Landing Pages:     {len(UK_CITIES) * len(TRADES)}")
    print(f"Complete Pages (5+):     {complete_pages}")
    print(f"Incomplete Pages (<5):   {incomplete_pages}")
    print("--------------------------------------------------")

    # 5. Save Gap Report
    report_data = {
        "summary": {
            "total_listings": len(all_rows),
            "total_landing_pages": len(UK_CITIES) * len(TRADES),
            "complete_pages": complete_pages,
            "incomplete_pages": incomplete_pages
        },
        "gaps": gap_report,
        "unknown_locations_in_db": list(unknown_locations)
    }
    
    with open("uk_audit_report.json", "w") as f:
        json.dump(report_data, f, indent=2)
        
    print(f"\nFull report saved to: uk_audit_report.json")
    
    # 6. Show Top Gaps (Preview)
    print("\nGAP PREVIEW (First 10 Incomplete):")
    for gap in gap_report[:10]:
        print(f"   - {gap['city']} [{gap['trade']}]: Has {gap['current']}, Needs {gap['needed']}")
        
    if unknown_locations:
        print(f"\nFound {len(unknown_locations)} cities in DB not in target list (potential missed landing pages):")
        # Show top 5
        print(f"   Examples: {', '.join(list(unknown_locations)[:5])}")

if __name__ == "__main__":
    main()
