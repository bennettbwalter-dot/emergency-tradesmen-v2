import re
import os

town_county_map = {
    "Accrington": "Lancashire", "Ashford": "Kent", "Aylesbury": "Buckinghamshire", "Barnstaple": "Devon", 
    "Barrow-in-Furness": "Cumbria", "Basildon": "Essex", "Basingstoke": "Hampshire", "Bedford": "Bedfordshire", 
    "Beeston": "Nottinghamshire", "Birmingham": "West Midlands", "Blackburn": "Lancashire", "Blackpool": "Lancashire", 
    "Bournemouth": "Dorset", "Bracknell": "Berkshire", "Braintree": "Essex", "Brighton": "East Sussex", 
    "Brighton & Hove": "East Sussex", "Bromsgrove": "Worcestershire", "Burnley": "Lancashire", "Burton upon Trent": "Staffordshire", 
    "Cambridge": "Cambridgeshire", "Cannock": "Staffordshire", "Canterbury": "Kent", "Canvey Island": "Essex", 
    "Carlisle": "Cumbria", "Chatham": "Kent", "Chelmsford": "Essex", "Cheltenham": "Gloucestershire", 
    "Cheshunt": "Hertfordshire", "Chester": "Cheshire", "Chichester": "West Sussex", "Chorley": "Lancashire", 
    "Clacton-on-Sea": "Essex", "Colchester": "Essex", "Corby": "Northamptonshire", "Coventry": "West Midlands", 
    "Crawley": "West Sussex", "Crewe": "Cheshire", "Darlington": "County Durham", "Dartford": "Kent", 
    "Derby": "Derbyshire", "Dover": "Kent", "Dunstable": "Bedfordshire", "Durham": "County Durham", 
    "Eastbourne": "East Sussex", "Ellesmere Port": "Cheshire", "Ely": "Cambridgeshire", "Ewell": "Surrey", 
    "Exeter": "Devon", "Falmouth": "Cornwall", "Fareham": "Hampshire", "Folkestone": "Kent", 
    "Gateshead": "Tyne and Wear", "Gillingham": "Kent", "Gloucester": "Gloucestershire", "Gosport": "Hampshire", 
    "Grantham": "Lincolnshire", "Gravesend": "Kent", "Great Yarmouth": "Norfolk", "Grimsby": "Lincolnshire", 
    "Guildford": "Surrey", "Halesowen": "West Midlands", "Harlow": "Essex", "Harrogate": "North Yorkshire", 
    "Hartlepool": "County Durham", "Hastings": "East Sussex", "Hemel Hempstead": "Hertfordshire", "Hereford": "Herefordshire", 
    "High Wycombe": "Buckinghamshire", "Hull": "East Yorkshire", "Ipswich": "Suffolk", "Kendal": "Cumbria", 
    "Kettering": "Northamptonshire", "Kidderminster": "Worcestershire", "King's Lynn": "Norfolk", 
    "Kingston upon Thames": "London", "Lancaster": "Lancashire", "Leamington Spa": "Warwickshire", 
    "Leeds": "West Yorkshire", "Leicester": "Leicestershire", "Lichfield": "Staffordshire", "Lincoln": "Lincolnshire", 
    "Loughborough": "Leicestershire", "Lowestoft": "Suffolk", "Luton": "Bedfordshire", "Lytham St Annes": "Lancashire", 
    "Macclesfield": "Cheshire", "Maidenhead": "Berkshire", "Leighton Buzzard": "Bedfordshire", "Maidstone": "Kent", 
    "Mansfield": "Nottinghamshire", "Margate": "Kent", "Middlesbrough": "North Yorkshire", "Milton Keynes": "Buckinghamshire", 
    "Morecambe": "Lancashire", "Newcastle upon Tyne": "Tyne and Wear", "Newcastle-upon-Tyne": "Tyne and Wear", 
    "Newquay": "Cornwall", "Northampton": "Northamptonshire", "Norwich": "Norfolk", "Nottingham": "Nottinghamshire", 
    "Nuneaton": "Warwickshire", "Oxford": "Oxfordshire", "Paignton": "Devon", "Penrith": "Cumbria", 
    "Peterborough": "Cambridgeshire", "Plymouth": "Devon", "Poole": "Dorset", "Portsmouth": "Hampshire", 
    "Preston": "Lancashire", "Rayleigh": "Essex", "Reading": "Berkshire", "Redcar": "North Yorkshire", 
    "Redditch": "Worcestershire", "Richmond upon Thames": "London", "Ripon": "North Yorkshire", 
    "Royal Tunbridge Wells": "Kent", "Rugby": "Warwickshire", "Runcorn": "Cheshire", "Salisbury": "Wiltshire", 
    "Scarborough": "North Yorkshire", "Scunthorpe": "Lincolnshire", "Shrewsbury": "Shropshire", 
    "Sittingbourne": "Kent", "Skelmersdale": "Lancashire", "Slough": "Berkshire", "South Shields": "Tyne and Wear", 
    "Southampton": "Hampshire", "Southend-on-Sea": "Essex", "St Albans": "Hertfordshire", "St Austell": "Cornwall", 
    "Stafford": "Staffordshire", "Staines": "Surrey", "Stevenage": "Hertfordshire", "Stockton-on-Tees": "County Durham", 
    "Stoke-on-Trent": "Staffordshire", "Sunderland": "Tyne and Wear", "Swindon": "Wiltshire", "Tamworth": "Staffordshire", 
    "Taunton": "Somerset", "Telford": "Shropshire", "Torquay": "Devon", "Tower Hamlets": "London", 
    "Truro": "Cornwall", "Tunbridge Wells": "Kent", "Tynemouth": "Tyne and Wear", "Warrington": "Cheshire", 
    "Washington": "Tyne and Wear", "Watford": "Hertfordshire", "Wellingborough": "Northamptonshire", "Wells": "Somerset", 
    "Welwyn Garden City": "Hertfordshire", "Weymouth": "Dorset", "Whitehaven": "Cumbria", "Widnes": "Cheshire", 
    "Winchester": "Hampshire", "Woking": "Surrey", "Woolwich": "London", "Worcester": "Worcestershire", 
    "Workington": "Cumbria", "Worthing": "West Sussex", "Yeovil": "Somerset", "York": "North Yorkshire",
    
    # Scotland
    "Aberdeen": "Aberdeenshire", "Ayr": "Ayrshire", "Dumfries": "Dumfriesshire", "Dundee": "Angus", 
    "Falkirk": "Stirlingshire", "Glenrothes": "Fife", "Greenock": "Renfrewshire", "Inverness": "Highlands", 
    "Kilmarnock": "Ayrshire", "Perth": "Perthshire", "Stirling": "Stirlingshire",
    
    # Wales
    "Bridgend": "Glamorgan", "Llandudno": "Conwy", "Llanelli": "Carmarthenshire", "Merthyr Tydfil": "Glamorgan", 
    "Neath": "Glamorgan", "Port Talbot": "Glamorgan", "Rhyl": "Denbighshire", "St Asaph": "Denbighshire", 
    "St Davids": "Pembrokeshire", "Swansea": "Glamorgan", "Wrexham": "Clwyd",
    
    # Northern Ireland
    "Armagh": "County Armagh", "Bangor": "County Down", "Belfast": "County Antrim", "Coleraine": "County Londonderry", 
    "Derry": "County Londonderry", "Enniskillen": "County Fermanagh", "Lisburn": "County Antrim", 
    "Londonderry": "County Londonderry", "Newry": "County Down", "Omagh": "County Tyrone"
}

rename_map = {}
for town, county in town_county_map.items():
    rename_map[town] = f"{town} ({county})"

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    new_content = content
    for old_name, new_name in rename_map.items():
        # Replace only exact string matches inside quotes
        new_content = re.sub(rf'"({old_name})"', f'"{new_name}"', new_content)
        new_content = re.sub(rf"'({old_name})'", f"'{new_name}'", new_content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

files = [
    'src/lib/cityPostcodes.ts',
    'src/lib/uk-city-grouping.ts',
    'src/pages/TradeCityPage.tsx',
    'src/components/Footer.tsx',
    'src/lib/trades.ts'
]

for f in files:
    process_file(f)

print("Done mapping all remaining UK towns to their counties/regions.")
