
import os

source = "../scripts/index_temp.tsx"
dest = "recovered_index.tsx"

try:
    with open(source, "rb") as f:
        raw = f.read()
    
    # Try detecting BOM
    # FF FE = UTF-16LE
    # FE FF = UTF-16BE
    # EF BB BF = UTF-8
    
    encoding = 'utf-8' # Default
    if raw.startswith(b'\xff\xfe'):
        encoding = 'utf-16' # LE
    elif raw.startswith(b'\xfe\xff'):
        encoding = 'utf-16-be'
    
    print(f"Detected BOM/Default: {encoding}")
    
    text = raw.decode(encoding, errors='ignore')
    
    if "import" in text and "React" in text:
        with open(dest, "w", encoding="utf-8") as f:
            f.write(text)
        print("Recovered with content check")
    else:
        # Fallback: Try decoding as UTF-16LE explicitly if it failed logic
        text = raw.decode('utf-16', errors='ignore')
        if "import" in text:
             with open(dest, "w", encoding="utf-8") as f:
                f.write(text)
             print("Recovered via forced UTF-16")
        else:
             print("Content check failed")

except Exception as e:
    print(e)
