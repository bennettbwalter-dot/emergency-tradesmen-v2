import os
import re

path = "../src/pages/TradeCityPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Find the listings grid div and add an ID
# Look for the div that contains filteredBusinesses.map
pattern = r'(<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">)\s*{filteredBusinesses\.map'
replacement = r'<div id="listings" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">\n                {filteredBusinesses.map'

content = re.sub(pattern, replacement, content)

# Step 2: Update the Contact button to scroll to #listings instead of #services
content = content.replace(
    "document.getElementById('services')",
    "document.getElementById('listings')"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated scroll target to listings section")
print("✅ Contact button will now show first row of business listings")
