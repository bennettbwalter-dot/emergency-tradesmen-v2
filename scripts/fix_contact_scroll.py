import os
import re

path = "../src/pages/TradeCityPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Add ID to the Services section instead of listings
content = re.sub(
    r'(<section className="container-wide py-16 bg-card/30">)',
    r'<section id="services" className="container-wide py-16 bg-card/30">',
    content,
    count=1
)

# Step 2: Remove the id="listings" if it was added
content = content.replace('id="listings"', '')

# Step 3: Update the Contact button to scroll to #services instead of #listings
content = re.sub(
    r"document\.getElementById\('listings'\)",
    r"document.getElementById('services')",
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated Contact button to scroll to Services section (above listings)")
