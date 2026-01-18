import re

filepath = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\lib\trades.ts"

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

key_pattern = re.compile(r'^\s*"([^"]+)":\s*\[')
found_keys = {}
duplicates = []

for i, line in enumerate(lines):
    match = key_pattern.match(line)
    if match:
        key = match.group(1)
        if key in found_keys:
            duplicates.append((key, i + 1, found_keys[key]))
        else:
            found_keys[key] = i + 1

if duplicates:
    print("Found duplicate keys:")
    for key, line, first_line in duplicates:
        print(f"Key '{key}' at line {line} (first seen at {first_line})")
else:
    print("No duplicates found.")
