import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# The Visibility Box code block
visibility_box_start = '{/* Visibility Into Call-Outs Box for Tradesmen */}'
visibility_box_end = '              </div>\n\n                <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">'

# Extract the box
import re
pattern = re.compile(re.escape(visibility_box_start) + '.*?' + re.escape('              </div>'), re.DOTALL)
match = pattern.search(content)

if not match:
    print("Could not find Visibility Box block.")
    exit(1)

box_code = match.group(0)

# Remove the box from its current location
content = content.replace(box_code + "\n\n", "")

# Insertion point: Before the CTA Section
cta_marker = "{/* CTA Section */}"

if cta_marker in content:
    # We want it to be a separate section or within a container?
    # Let's wrap it in a container-wide container to maintain alignment
    new_box_section = f"""          <div className="container-wide pt-12">
            {box_code}
          </div>\n\n"""
    
    content = content.replace(cta_marker, new_box_section + cta_marker)
    print("Visibility box moved above CTA section.")
else:
    print("CTA Section marker not found.")
    exit(1)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)
