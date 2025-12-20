import os
import re

# Files to update with old logo references
files_to_update = [
    "../src/components/admin/AdminLayout.tsx",
    "../src/components/Footer.tsx"
]

# Update old logo references
for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace old logo with new
        content = content.replace('src="/et-logo.jpg"', 'src="/et-logo-new.png"')
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        
        print(f"Updated {file_path}")
    else:
        print(f"File not found: {file_path}")

print("\nOld logo references updated successfully!")
