import re

# Read the SearchForm component
search_form_path = r'c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\components\SearchForm.tsx'

with open(search_form_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the auto-routing useEffect that causes immediate navigation
# This is the problematic code that navigates as soon as both trade and city are selected
auto_route_pattern = r'\s*// Auto-routing when both are selected\s*useEffect\(\(\) => \{\s*if \(selectedTrade && selectedCity\) \{\s*navigate\(`/emergency-\$\{selectedTrade\}/\$\{selectedCity\.toLowerCase\(\)\}`\);\s*\}\s*\}, \[selectedTrade, selectedCity, navigate\]\);'

# Remove the auto-routing effect
content = re.sub(auto_route_pattern, '', content, flags=re.MULTILINE)

# Also handle variations without the comment
auto_route_pattern_no_comment = r'\s*useEffect\(\(\) => \{\s*if \(selectedTrade && selectedCity\) \{\s*navigate\(`/emergency-\$\{selectedTrade\}/\$\{selectedCity\.toLowerCase\(\)\}`\);\s*\}\s*\}, \[selectedTrade, selectedCity, navigate\]\);'

content = re.sub(auto_route_pattern_no_comment, '', content, flags=re.MULTILINE)

# Write back
with open(search_form_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("✓ Removed auto-routing useEffect from SearchForm")
print("✓ Users must now click 'Find Help Now' button to navigate to listings")
