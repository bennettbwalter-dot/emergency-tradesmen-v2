import os
import re

path = "../src/pages/TradeCityPage.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Use regex to find and replace the Contact button block with flexible whitespace
pattern = r'<Button\s+variant="hero"\s+asChild>\s*<Link\s+to="/contact"\s+className="flex items-center gap-3">\s*<Phone\s+className="w-5 h-5"\s*/>\s*Contact Us\s*</Link>\s*</Button>'

replacement = '''<Button 
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

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

if new_content != content:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Successfully replaced Contact button with scroll button")
else:
    print("⚠️ Pattern not found - Contact button may already be updated or pattern doesn't match")

# Verify the change
with open(path, "r", encoding="utf-8") as f:
    verify_content = f.read()
    if 'Link to="/contact"' in verify_content:
        print("❌ Link still present - replacement failed")
    else:
        print("✅ Link removed successfully")
