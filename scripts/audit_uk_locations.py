
import os
import re
from supabase import create_client

# 1. Parse valid UK cities from cityPostcodes.ts
city_file = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\cityPostcodes.ts"
valid_cities = {}

with open(city_file, 'r', encoding='utf-8') as f:
    content = f.read()
    matches = re.findall(r'"([^"]+)":\s*"([^"]+)"', content)
    for city, postcode in matches:
        valid_cities[city.strip()] = postcode

print(f"Loaded {len(valid_cities)} valid UK cities.")

# 2. Setup Supabase
env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    paths = [env_path, ".env", "../.env"]
    for p in paths:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8-sig') as f:
                for line in f:
                    if "VITE_SUPABASE_URL=" in line: url = line.split("=", 1)[1].strip().strip('"')
                    if "VITE_SUPABASE_ANON_KEY=" in line: key = line.split("=", 1)[1].strip().strip('"')
            if url: break
except: pass

if not url:
    print("No Auth.")
    exit(1)

sb = create_client(url, key)

# Sort cities for matching priority
sorted_cities = sorted(valid_cities.keys(), key=len, reverse=True)

# 3. Stream Audit
print("Starting Stream Audit...")
batch_size = 500 # Smaller batch for responsiveness
start = 0
moves = 0
total_checked = 0

while True:
    try:
        res = sb.table('businesses').select('*').eq('country_code', 'GB').range(start, start + batch_size - 1).execute()
        data = res.data
        if not data: break
        
        # AUDIT THIS BATCH
        for item in data:
            total_checked += 1
            current_city = item.get('city')
            address = str(item.get('address') or "")
            name = str(item.get('name') or "")
            addr_lower = address.lower()
            name_lower = name.lower()
            
            # Match Logic
            found_in_addr = []
            for city in sorted_cities:
                if city.lower() in addr_lower:
                    found_in_addr.append(city)
            
            target = None
            if found_in_addr:
                # Heuristic: If current city is in the found list, trust it (it's valid).
                # Example: "123 London Rd, Manchester" -> Found: London, Manchester.
                # If current=Manchester, we are good.
                if current_city and current_city in found_in_addr:
                    continue
                
                # If current is NOT in list, assume mis-located.
                # target = found_in_addr[0] # The longest match? "Newcastle upon Tyne" vs "Newcastle" -- verified by sorting.
                # BUT "London Rd" matches London.
                # Context check?
                # Simplified: If ONE city found, take it. If multiple, check name?
                
                # Refined: Name match overrides Address ambiguity?
                found_in_name = []
                for city in sorted_cities:
                    if city.lower() in name_lower:
                        found_in_name.append(city)
                        
                if found_in_name:
                     if current_city not in found_in_name:
                         target = found_in_name[0]
                else:
                    # No name match, use first address match
                    target = found_in_addr[0]
            
            elif not found_in_addr:
                # Check Name Only
                found_in_name = []
                for city in sorted_cities:
                    if city.lower() in name_lower:
                        found_in_name.append(city)
                
                if found_in_name:
                    target = found_in_name[0]

            # Execute Move
            if target and target != current_city:
                print(f"MOVING [ID:{item['id']}] {name}: {current_city} -> {target}")
                sb.table('businesses').update({'city': target}).eq('id', item['id']).execute()
                moves += 1

        print(f"Batch {start}-{start+batch_size}: Checked {len(data)}, Moves {moves} (Total)")
        start += batch_size
        
    except Exception as e:
        print(f"Error in batch: {e}")
        # Continue?
        break

print(f"Audit Complete. Total Checked: {total_checked}, Total Moved: {moves}")
