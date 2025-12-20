
import os

source = "../scripts/index_temp.tsx"
dest = "recovered_index.tsx"

# Try encodings
encodings = ['utf-16', 'utf-16le', 'utf-16be']

for enc in encodings:
    try:
        with open(source, "r", encoding=enc) as f:
            content = f.read()
        
        # Check for expected content
        if "import" in content and "React" in content:
            print(f"Success with {enc}")
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
            exit(0)
    except:
        continue

print("Failed to recover")
