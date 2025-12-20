import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the color transitions to match master style exactly
# Text: gold → white (not white → gold)
# Dot/Ring: red → green (not green → red)

# Fix outer ring animation
content = content.replace(
    'animate={{ backgroundColor: ["#22C55E", "#EF4444"] }}',
    'animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}'
)

# Fix text color animation  
content = content.replace(
    'animate={{ color: ["#FFFFFF", "#D4AF37"] }}',
    'animate={{ color: ["#D4AF37", "#FFFFFF"] }}'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Fixed color transitions:")
print("  - Text: Gold → White")
print("  - Dot/Ring: Red → Green")
