import os
import re

file_path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the main card container class
# We match the part where it checks for isPremium/isPaid and applies border colors
# Standard pattern: isPremium ? "border-gold shadow-xl shadow-gold/10 bg-gradient-to-br from-gold/5 to-transparent" : "border-border/50 hover:border-gold/30"
import re
pattern = r'isPremium\s*\?\s*"[^"]+"\s*:\s*"[^"]+"'
matches = re.findall(pattern, content)
print(f"Found {len(matches)} styling matches")

for match in matches:
    if 'gold' in match:
        new_match = match.replace('gold', 'emerald-500')
        # Also fix the shadow and transparency values specifically for emerald
        new_match = new_match.replace('shadow-emerald-500/10', 'shadow-emerald-500/20')
        new_match = new_match.replace('from-emerald-500/5', 'from-emerald-500/10')
        content = content.replace(match, new_match)
        print(f"Replaced gold style with emerald: {new_match}")

# 2. Update specific gold text or background classes
content = content.replace('text-gold', 'text-emerald-500')
content = content.replace('bg-gold', 'bg-emerald-500')
content = content.replace('shadow-gold', 'shadow-emerald-500')
content = content.replace('border-gold', 'border-emerald-500')
content = content.replace('from-gold', 'from-emerald-500')
content = content.replace('hover:border-gold', 'hover:border-emerald-500')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully applied emerald styling to BusinessCard.tsx")
