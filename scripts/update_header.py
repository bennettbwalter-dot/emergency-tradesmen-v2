import os

header_path = r"..\src\components\Header.tsx"

with open(header_path, "r", encoding="utf-8") as f:
    content = f.read()

old_link = """            <Link to="/tradesmen" className="text-sm font-medium hover:text-gold transition-colors">
              For Tradesmen
            </Link>"""

new_button = """            <Button variant="outline" size="sm" asChild className="border-gold text-gold hover:bg-gold/10 px-4 rounded-md">
              <Link to="/tradesmen">
                Tradesmen Sign Up
              </Link>
            </Button>"""

if old_link in content:
    content = content.replace(old_link, new_button)
    print("Header updated successfully.")
else:
    # Try with slightly different whitespace if needed
    import re
    pattern = re.compile(r'<Link to="/tradesmen" className="text-sm font-medium hover:text-gold transition-colors">\s*For Tradesmen\s*</Link>', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(new_button, content)
        print("Header updated successfully using regex.")
    else:
        print("Could not find 'For Tradesmen' link in Header.tsx.")
        exit(1)

with open(header_path, "w", encoding="utf-8") as f:
    f.write(content)
