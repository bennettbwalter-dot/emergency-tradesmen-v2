import re
import os

# Data structure mapping major cities to their specific boroughs/sub-towns and a rough postcode
# Note: Postcodes are representative center-points; the AI orchestrator will find local businesses near these postcodes.
city_deconstruction = {
    "England": {
        "London": {
            "Camden": "NW1 8QL", "Greenwich": "SE10 9HZ", "Hackney": "E8 1DY", "Hammersmith": "W6 9JU", 
            "Islington": "N1 2UD", "Kensington": "W8 4PX", "Lambeth": "SW2 1RW", "Lewisham": "SE6 4RU",
            "Southwark": "SE1 2QH", "Tower Hamlets": "E14 2BG", "Wandsworth": "SW18 2PU", "Westminster": "SW1E 6QP",
            "Barking": "IG11 7LU", "Barnet": "EN5 5XY", "Bexley": "DA6 7AT", "Brent": "HA9 0FJ", 
            "Bromley": "BR1 1DP", "Croydon": "CR0 1EA", "Ealing": "W5 2HL", "Enfield": "EN1 3XY", 
            "Haringey": "N22 8HQ", "Harrow": "HA1 2XY", "Havering": "RM1 3BD", "Hillingdon": "UB8 1UW", 
            "Hounslow": "TW3 3EB", "Kingston": "KT1 1EU", "Merton": "SM4 5DX", "Newham": "E16 2QU", 
            "Redbridge": "IG1 1DD", "Richmond": "TW9 1EZ", "Sutton": "SM1 1EA", "Waltham Forest": "E17 4JF",
            "Chelsea": "SW3 5EE", "Fulham": "SW6 1AA"
        },
        "Manchester": {
            "Salford": "M3 6AQ", "Bolton": "BL1 1RU", "Bury": "BL9 0SW", "Oldham": "OL1 1RA", 
            "Rochdale": "OL16 1AB", "Stockport": "SK1 3XE", "Tameside": "OL6 6DU", "Trafford": "M32 0TH", 
            "Wigan": "WN1 1YN", "Altrincham": "WA14 1PG", "Sale": "M33 7ZF", "Didsbury": "M20 2SG",
            "Chorlton": "M21 9DQ", "Fallowfield": "M14 6WN", "Withington": "M20 4BX", "Levenshulme": "M19 3PJ",
            "Wythenshawe": "M22 5RX", "Prestwich": "M25 1AN", "Radcliffe": "M26 2QZ", "Middleton": "M24 4DU",
            "Ashton-under-Lyne": "OL6 6DL", "Hyde": "SK14 1AL", "Stretford": "M32 9AY", "Urmston": "M41 0PN",
            "Eccles": "M30 0EP", "Swinton": "M27 4AA"
        },
        "Birmingham": {
            "Edgbaston": "B15 2RU", "Sutton Coldfield": "B73 6AA", "Aston": "B6 6HE", "Bournville": "B30 2AA",
            "Erdington": "B24 8RE", "Harborne": "B17 9NT", "Moseley": "B13 8DD", "Selly Oak": "B29 6HT",
            "Shirley": "B90 3AL", "Smethwick": "B66 3AQ", "Solihull": "B91 3TB", "Walsall": "WS1 1TP",
            "West Bromwich": "B70 8JQ", "Wolverhampton": "WV1 1RQ", "Dudley": "DY1 1HF", "Stourbridge": "DY8 1EQ",
            "Halesowen": "B63 3AJ", "Oldbury": "B69 3DB", "Rowley Regis": "B65 9AH", "Tipton": "DY4 8QL",
            "Wednesbury": "WS10 7DF", "Brierley Hill": "DY5 1TR", "Kings Heath": "B14 7JZ", "Yardley": "B25 8RN"
        },
        "Leeds": {
            "Headingley": "LS6 2AS", "Horsforth": "LS18 4AQ", "Roundhay": "LS8 2EA", "Chapel Allerton": "LS7 3PD",
            "Moortown": "LS17 6AA", "Pudsey": "LS28 7AB", "Morley": "LS27 9DY", "Garforth": "LS25 1DS",
            "Wetherby": "LS22 6NE", "Otley": "LS21 1BQ", "Yeadon": "LS19 7PP", "Guiseley": "LS20 8AH",
            "Rothwell": "LS26 0AD", "Kippax": "LS25 7AQ", "Bramley": "LS13 2EF", "Armley": "LS12 3AB",
            "Beeston": "LS11 8PN", "Hunslet": "LS10 1DT", "Middleton": "LS10 4AX", "Cross Gates": "LS15 8BA",
            "Bradford": "BD1 1HY", "Halifax": "HX1 1UJ", "Huddersfield": "HD1 2SY", "Wakefield": "WF1 1HQ"
        },
        "Sheffield": {
            "Crookes": "S10 1UW", "Dore": "S17 3GW", "Ecclesall": "S11 8PR", "Fulwood": "S10 3TD",
            "Hillsborough": "S6 4HB", "Mosborough": "S20 5AD", "Stannington": "S6 6BP", "Walkley": "S6 5AB",
            "Chapeltown": "S35 2XD", "Stocksbridge": "S36 1DT", "Handsworth": "S13 9AZ", "Woodhouse": "S13 7LY",
            "Gleadless": "S12 2JS", "Meersbrook": "S8 9FL", "Norton": "S8 8JQ", "Beauchief": "S8 7BB",
            "Rotherham": "S60 1AE", "Barnsley": "S70 2JG", "Doncaster": "DN1 1AA", "Chesterfield": "S40 1PB"
        },
        "Bristol": {
            "Clifton": "BS8 4AB", "Redland": "BS6 6AD", "Bishopston": "BS7 8AL", "Bedminster": "BS3 4EW",
            "Southville": "BS3 1AS", "Brislington": "BS4 5AH", "Kingswood": "BS15 8HR", "Filton": "BS34 7AF",
            "Patchway": "BS34 5NB", "Bradley Stoke": "BS32 8AH", "Keynsham": "BS31 1DQ", "Portishead": "BS20 6AQ",
            "Clevedon": "BS21 6AE", "Nailsea": "BS48 1AW", "Yate": "BS37 4AQ", "Thornbury": "BS35 2AR",
            "Staple Hill": "BS16 5HQ", "Fishponds": "BS16 3AA", "Frenchay": "BS16 1NB", "Westbury on Trym": "BS9 3ED"
        },
        "Liverpool": {
            "Anfield": "L4 0TH", "Everton": "L5 5BX", "Walton": "L4 5SX", "Bootle": "L20 3BA",
            "Crosby": "L23 2TA", "Maghull": "L31 0AH", "Kirkby": "L32 8RD", "Huyton": "L36 9UJ",
            "Prescot": "L34 5PT", "St Helens": "WA10 1HP", "Newton-le-Willows": "WA12 9RU", "Haydock": "WA11 0GD",
            "Widnes": "WA8 7TF", "Runcorn": "WA7 1AB", "Birkenhead": "CH41 5AL", "Wallasey": "CH44 1AQ",
            "Bebington": "CH63 7PT", "Heswall": "CH60 0AD", "Hoylake": "CH47 2AB", "West Kirby": "CH48 4DZ",
            "Aigburth": "L17 8XW", "Allerton": "L18 2DD", "Woolton": "L25 7TD", "Garston": "L19 2LQ"
        }
    },
    "Scotland": {
        "Glasgow": {
            "Partick": "G11 6AA", "Hillhead": "G12 8QQ", "Shawlands": "G41 3DX", "Cathcart": "G44 4ED",
            "Langside": "G42 9JU", "Govan": "G51 3TR", "Ibrox": "G51 2YD", "Maryhill": "G20 0EP",
            "Springburn": "G21 1EA", "Dennistoun": "G31 2PB", "Shettleston": "G32 7NR", "Baillieston": "G69 6NE",
            "Cambuslang": "G72 7EE", "Rutherglen": "G73 1AB", "Bearsden": "G61 2SX", "Milngavie": "G62 6PS",
            "Clydebank": "G81 1TG", "Dumbarton": "G82 1AA", "Paisley": "PA1 1AA", "Renfrew": "PA4 8UR",
            "Johnstone": "PA5 8AA", "East Kilbride": "G74 1AB", "Hamilton": "ML3 6AU", "Motherwell": "ML1 1AB",
            "Coatbridge": "ML5 3AA", "Airdrie": "ML6 6AA", "Cumbernauld": "G67 1AA"
        },
        "Edinburgh": {
            "Leith": "EH6 6JU", "Morningside": "EH10 4DP", "Bruntsfield": "EH10 4EQ", "Marchmont": "EH9 1AE",
            "Newington": "EH8 9LY", "Stockbridge": "EH4 1JQ", "Corstorphine": "EH12 7TQ", "Murrayfield": "EH12 6HN",
            "Gorgie": "EH11 2AR", "Dalry": "EH11 2EB", "Portobello": "EH15 1AA", "Musselburgh": "EH21 6AA",
            "Dalkeith": "EH22 1AA", "Penicuik": "EH26 8AA", "Loanhead": "EH20 9AA", "Bonnyrigg": "EH19 2AA",
            "Currie": "EH14 5AA", "Balerno": "EH14 7AA", "Queensferry": "EH30 9AA", "Kirkliston": "EH29 9AA",
            "Broxburn": "EH52 5AA", "Livingston": "EH54 6EG", "Bathgate": "EH48 1AA", "Linlithgow": "EH49 7EQ"
        }
    },
    "Wales": {
        "Cardiff": {
            "Canton": "CF5 1AA", "Roath": "CF24 3AA", "Cathays": "CF24 4AA", "Splott": "CF24 2AA",
            "Grangetown": "CF11 7AA", "Riverside": "CF11 9AA", "Pontcanna": "CF11 9AA", "Llandaff": "CF5 2AA",
            "Whitchurch": "CF14 1AA", "Rhiwbina": "CF14 6AA", "Llanishen": "CF14 5AA", "Cyncoed": "CF23 6AA",
            "Penylan": "CF23 5AA", "Rumney": "CF3 3AA", "Llanrumney": "CF3 4AA", "St Mellons": "CF3 0AA",
            "Ely": "CF5 4AA", "Caerau": "CF5 5AA", "Fairwater": "CF5 3AA", "Radyr": "CF15 8AA",
            "Penarth": "CF64 1AA", "Barry": "CF62 8AA", "Dinas Powys": "CF64 4AA", "Llantwit Major": "CF61 1AA",
            "Caerphilly": "CF83 1AA", "Pontypridd": "CF37 1AA", "Newport": "NP20 1AA", "Cwmbran": "NP44 1AA"
        }
    }
}

# The generic names to remove
generics = [
    "London (Greater London)", "Manchester (Greater Manchester)", "Birmingham (West Midlands)",
    "Leeds (West Yorkshire)", "Sheffield (South Yorkshire)", "Bristol (Bristol)",
    "Liverpool (Merseyside)", "Glasgow (Lanarkshire)", "Edinburgh (Midlothian)",
    "Cardiff (South Glamorgan)",
    # And the non-county versions just in case
    "London", "Manchester", "Birmingham", "Leeds", "Sheffield", "Bristol", 
    "Liverpool", "Glasgow", "Edinburgh", "Cardiff"
]

def update_cityPostcodes():
    path = "src/lib/cityPostcodes.ts"
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
        
    # Remove generics
    new_lines = []
    for line in lines:
        keep = True
        for g in generics:
            if f'"{g}"' in line or f"'{g}'" in line:
                keep = False
                break
        if keep:
            new_lines.append(line)
            
    # Find the end of the dictionary (before the last closing brace)
    insert_idx = len(new_lines) - 1
    while insert_idx > 0 and "}" not in new_lines[insert_idx]:
        insert_idx -= 1
        
    if insert_idx <= 0:
        insert_idx = len(new_lines) # Fallback
        
    # Build string to insert
    insert_str = "\n    // --- DECONSTRUCTED MAJOR CITIES ---\n"
    for country, cities in city_deconstruction.items():
        for parent_city, boroughs in cities.items():
            insert_str += f"    // {parent_city} Boroughs\n"
            for borough, postcode in boroughs.items():
                insert_str += f'    "{borough} ({parent_city})": "{postcode}",\n'
                
    new_lines.insert(insert_idx, insert_str)
    
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)

def update_uk_city_grouping():
    path = "src/lib/uk-city-grouping.ts"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Remove generics
    for g in generics:
        content = content.replace(f'"{g}", ', '')
        content = content.replace(f'"{g}"', '') # at end of line
        
    # Parse the arrays to insert the new items
    for country, cities in city_deconstruction.items():
        new_boroughs = []
        for parent_city, boroughs in cities.items():
            for borough in boroughs.keys():
                new_boroughs.append(f'"{borough} ({parent_city})"')
                
        # Find the country array and inject
        pattern = rf'"{country}": \[(.*?)\]'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            existing_items = match.group(1).split(',')
            existing_items = [i.strip() for i in existing_items if i.strip()]
            
            # Add new, deduplicate, and sort
            all_items = set(existing_items + new_boroughs)
            
            # Remove empty strings
            all_items = {i for i in all_items if i}
            
            sorted_items = sorted(list(all_items))
            
            # Format nicely, 10 per line
            formatted_lines = []
            for i in range(0, len(sorted_items), 10):
                formatted_lines.append('        ' + ', '.join(sorted_items[i:i+10]))
                
            new_array_content = ',\n'.join(formatted_lines)
            
            content = content.replace(match.group(1), '\n' + new_array_content + '\n    ')

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

update_cityPostcodes()
update_uk_city_grouping()
print("Deconstruction complete.")
