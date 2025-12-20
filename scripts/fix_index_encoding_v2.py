
import os

backup_path = "head_index.tsx"
target_path = "../src/pages/Index.tsx"

# Try reading as utf-8, if fails, try utf-16
content = ""
try:
    with open(backup_path, "r", encoding="utf-8") as f:
        content = f.read()
except UnicodeDecodeError:
    try:
        with open(backup_path, "r", encoding="utf-16") as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading backup: {e}")
        exit(1)

# Clean null bytes if any
content = content.replace('\x00', '')

with open(target_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"restored {len(content)} bytes to Index.tsx")
