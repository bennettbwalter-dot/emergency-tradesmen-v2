import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the broken className - the style prop was inserted in the middle of the className string
# Line 130 has: className="animate-ping" style={{ backgroundColor: "#EF4444" }} absolute inline-flex h-full w-full rounded-full opacity-75"
# Should be: className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#EF4444" }}

content = content.replace(
    'className="animate-ping" style={{ backgroundColor: "#EF4444" }} absolute inline-flex h-full w-full rounded-full opacity-75"',
    'className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: "#EF4444" }}'
)

# Fix the second motion.span if it has the same issue
content = content.replace(
    'className="relative inline-flex" style={{ backgroundColor: "#EF4444" }} rounded-full h-2 w-2"',
    'className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#EF4444" }}'
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Fixed syntax error in BusinessCard.tsx")
print("  - Corrected className attribute")
print("  - Moved style prop to proper position")
