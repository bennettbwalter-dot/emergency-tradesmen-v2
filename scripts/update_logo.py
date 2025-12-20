import os
import re

# Update Header.tsx
header_path = "../src/components/Header.tsx"
with open(header_path, "r", encoding="utf-8") as f:
    header_content = f.read()

# Replace the logo path
header_content = header_content.replace(
    'src="/et-logo.jpg"',
    'src="/et-logo-new.png"'
)

with open(header_path, "w", encoding="utf-8") as f:
    f.write(header_content)

print("Updated Header.tsx")

# Update Index.tsx
index_path = "../src/pages/Index.tsx"
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Replace the schema logo URL
index_content = index_content.replace(
    'logo: "https://emergencytrades.co.uk/logo.png"',
    'logo: "https://emergencytrades.co.uk/et-logo-new.png"'
)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

print("Updated Index.tsx")
