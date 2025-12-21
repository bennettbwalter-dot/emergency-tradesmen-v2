
import os

path = 'src/pages/Index.tsx'
if os.path.exists(path):
    with open(path, 'rb') as f:
        content = f.read()
    
    if b'\x00' in content:
        print(f"Found null bytes in {path}. Removing...")
        new_content = content.replace(b'\x00', b'')
        with open(path, 'wb') as f:
            f.write(new_content)
        print("Fixed.")
    else:
        print("No null bytes found.")
else:
    print(f"File not found: {path}")
