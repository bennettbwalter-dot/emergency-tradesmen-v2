import os
import re

path = "../src/pages/TradeCityPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace the entire Contact button block
# The button is currently: <Button variant="hero" asChild><Link to="/contact">...</Link></Button>
# We need to change it to: <Button variant="hero" onClick={...}>...</Button>

old_pattern = r'''<Button variant="hero" asChild>
                    <Link to="/contact" className="flex items-center gap-3">
                      <Phone className="w-5 h-5" />
                      Contact Us
                    </Link>
                  </Button>'''

new_button = '''<Button 
                    variant="hero" 
                    onClick={() => {
                      document.getElementById('services')?.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                      });
                    }}
                    className="flex items-center gap-3"
                  >
                    <Phone className="w-5 h-5" />
                    Contact Us
                  </Button>'''

content = content.replace(old_pattern, new_button)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Replaced Contact button Link with scroll button")
