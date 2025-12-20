import os
import re

file_path = os.path.join('..', 'src', 'pages', 'PremiumProfileEditor.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Use a more robust regex to find the .update() object and insert fields
# We match everything inside .update({...})
update_pattern = r"(\.update\(\{)([\s\S]+?)(\}\))"

def replace_update(match):
    pre = match.group(1)
    body = match.group(2)
    post = match.group(3)
    
    # Check if city and verified already exist
    if 'city:' not in body:
        # Insert city after trade
        body = re.sub(r'(trade: selectedTrade,)', r'\1\n                    city: selectedLocations[0], // Sync city field with first location', body)
    
    if 'verified:' not in body:
        # Insert verified after tier
        body = re.sub(r"(tier: 'paid')", r"\1,\n                    verified: true // Automatically verify premium profiles", body)
        
    return pre + body + post

new_content = re.sub(update_pattern, replace_update, content)

# Also fix the auto-creation block to set verified: true and use a better name
create_pattern = r'(name: "Developer Test Business",\s+trade: "electrician",\s+city: "London",)'
create_replacement = 'name: "Your Business",\n                        trade: "plumber",\n                        city: "London",\n                        verified: true,'

new_content = re.sub(create_pattern, create_replacement, new_content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Successfully applied visibility fixes to PremiumProfileEditor.tsx using regex.")
