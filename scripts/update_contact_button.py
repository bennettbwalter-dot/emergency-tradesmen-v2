import os
import re

path = "../src/pages/TradeCityPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Add ID to the listings section
# Find the section that contains the business cards grid
content = re.sub(
    r'(<section className="container mx-auto px-4 py-12">)',
    r'<section id="listings" className="container mx-auto px-4 py-12">',
    content,
    count=1
)

# Step 2: Replace the Contact button Link with a scroll button
# Find and replace the Contact Us button
old_button = '''                  <Button variant="hero" asChild>
                    <Link to="/contact" className="flex items-center gap-3">
                      <Phone className="w-5 h-5" />
                      Contact Us
                    </Link>
                  </Button>'''

new_button = '''                  <Button 
                    variant="hero" 
                    onClick={() => {
                      document.getElementById('listings')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    Contact Us
                  </Button>'''

content = content.replace(old_button, new_button)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated Contact button to scroll to listings section")
