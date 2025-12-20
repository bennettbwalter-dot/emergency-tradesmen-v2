import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove all style props from motion.span components
# The master implementation doesn't use style props - framer-motion handles everything via animate prop

# Remove style from outer ring
content = re.sub(
    r'style=\{\{ backgroundColor: "#EF4444" \}\}',
    '',
    content
)

# Remove style from text
content = re.sub(
    r'style=\{\{ color: "#D4AF37" \}\}',
    '',
    content
)

# Clean up any double spaces left behind
content = re.sub(r'  +', ' ', content)
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Removed style props from motion.span components")
print("  - Framer Motion will now handle all color animations via animate prop")
print("  - This matches the master 'Tradespeople Available Now' implementation")
