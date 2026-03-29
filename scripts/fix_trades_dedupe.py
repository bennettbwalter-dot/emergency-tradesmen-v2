import re

filepath = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\trades.ts"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_object = False
seen_keys = set()
object_indent = ""

# Heuristic: We only deduplicate inside specific large objects
target_objects = ["export const cityToState", "const serviceAreaMap"]

for line in lines:
    # Check if entering a target object
    for target in target_objects:
        if target in line and "{" in line:
            in_object = True
            seen_keys.clear()
            new_lines.append(line)
            continue
    
    if in_object:
        # Check for end of object
        if re.match(r'^\s*};', line):
            in_object = False
            new_lines.append(line)
            continue
            
        # Extract key
        match = re.search(r'^\s*"([^"]+)"\s*:', line)
        if match:
            key = match.group(1)
            if key in seen_keys:
                print(f"Removing duplicate key: {key}")
                continue # Skip this line
            seen_keys.add(key)
        
        # Check for simple string key 'Key': 'Value'
        match_simple = re.search(r"^\s*'([^']+)'\s*:", line)
        if match_simple:
            key = match_simple.group(1)
            if key in seen_keys:
                 print(f"Removing duplicate key: {key}")
                 continue
            seen_keys.add(key)

        new_lines.append(line)
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Done. Duplicates removed.")
