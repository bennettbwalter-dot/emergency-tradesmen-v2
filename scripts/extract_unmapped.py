import re
import os
import json

# Read current uk-city-grouping.ts
with open('src/lib/uk-city-grouping.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all towns
all_towns = re.findall(r'"([^"]+)"', content)

# Filter towns that don't have a parent (no parentheses) and aren't already counties themselves
counties = {"Berkshire", "Buckinghamshire", "Cambridgeshire", "Cheshire", "Cornwall", "Cumbria", "Derbyshire", "Devon", "Dorset", "Essex", "Gloucestershire", "Hampshire", "Herefordshire", "Hertfordshire", "Kent", "Lancashire", "Leicestershire", "Lincolnshire", "Norfolk", "Northamptonshire", "Northumberland", "Nottinghamshire", "Oxfordshire", "Shropshire", "Somerset", "Staffordshire", "Suffolk", "Surrey", "Sussex", "Warwickshire", "Wiltshire", "Worcestershire", "Yorkshire"}

unmapped_towns = [t for t in all_towns if '(' not in t and t not in counties and t not in ["England", "Scotland", "Wales", "Northern Ireland"]]

# We will print the unmapped towns so I can write a mapping dictionary for them.
print(json.dumps(unmapped_towns))
