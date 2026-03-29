import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Add style prop with initial backgroundColor to ensure colors render
# For the outer ring (ping effect)
content = re.sub(
    r'(<motion\.span\s+animate=\{\{ backgroundColor: \["#EF4444", "#22C55E"\] \}\}\s+transition=\{\{ duration: 2, repeat: Infinity, repeatType: "reverse" \}\}\s+className="animate-ping)',
    r'\1" style={{ backgroundColor: "#EF4444" }}',
    content
)

# For the inner dot
content = re.sub(
    r'(<motion\.span\s+animate=\{\{ backgroundColor: \["#EF4444", "#22C55E"\] \}\}\s+transition=\{\{ duration: 2, repeat: Infinity, repeatType: "reverse" \}\}\s+className="relative inline-flex)',
    r'\1" style={{ backgroundColor: "#EF4444" }}',
    content
)

# For the text color
content = re.sub(
    r'(<motion\.span\s+animate=\{\{ color: \["#D4AF37", "#FFFFFF"\] \}\}\s+transition=\{\{ duration: 1\.5, repeat: Infinity, repeatType: "reverse" \}\})',
    r'\1 style={{ color: "#D4AF37" }}',
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Added initial style props to motion.span components")
print("  - Outer ring: starts with red (#EF4444)")
print("  - Inner dot: starts with red (#EF4444)")
print("  - Text: starts with gold (#D4AF37)")
