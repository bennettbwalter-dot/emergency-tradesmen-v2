import re
import os

city_boroughs = {
  "London": ["Westminster", "Hackney", "Islington", "Ealing", "Croydon", "Camden", "Greenwich", "Chelsea", "Fulham", "Hounslow", "Wandsworth", "Southwark", "Merton", "Richmond", "Kingston", "Bromley", "Redbridge", "Newham", "Waltham Forest", "Enfield", "Harrow", "Uxbridge", "Wembley"],
  "Manchester": ["Salford", "Stockport", "Altrincham", "Sale", "Bury", "Rochdale", "Oldham", "Wigan", "Bolton"],
  "Birmingham": ["Sutton Coldfield", "Dudley", "Walsall", "West Bromwich", "Solihull", "Wolverhampton"],
  "Leeds": ["Bradford", "Wakefield", "Halifax", "Huddersfield", "Keighley", "Pontefract", "Batley", "Castleford"],
  "Glasgow": ["Paisley", "Clydebank", "Motherwell", "Hamilton", "East Kilbride", "Coatbridge", "Cumbernauld"],
  "Liverpool": ["Birkenhead", "Wallasey", "Crosby", "Bebington", "St Helens", "Southport"],
  "Sheffield": ["Rotherham", "Barnsley", "Doncaster", "Chesterfield"],
  "Bristol": ["Bath", "Weston-super-Mare"],
  "Edinburgh": ["Livingston", "Dunfermline", "Kirkcaldy"],
  "Cardiff": ["Newport", "Barry", "Caerphilly", "Cwmbran"]
}

# Reverse map: "Westminster" -> "Westminster (London)"
rename_map = {}
for parent_city, boroughs in city_boroughs.items():
    for borough in boroughs:
        rename_map[borough] = f"{borough} ({parent_city})"

def process_file(filepath):
    if not os.path.exists(filepath):
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Replace the exact borough strings with the formatted ones
    # We only want to replace them when they are surrounded by quotes.
    # We have to be careful with things like "Westminster" -> "Westminster (London)"
    
    new_content = content
    for old_name, new_name in rename_map.items():
        # Replace "Old Name" with "New Name"
        new_content = re.sub(rf'"({old_name})"', f'"{new_name}"', new_content)
        new_content = re.sub(rf"'({old_name})'", f"'{new_name}'", new_content)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filepath}")

# Files to process
files = [
    'src/lib/cityPostcodes.ts',
    'src/lib/uk-city-grouping.ts',
    'src/pages/TradeCityPage.tsx',
    'src/components/Footer.tsx',
    'src/lib/trades.ts'
]

for f in files:
    process_file(f)

print("Done formatting cities.")
