
path = "../src/pages/Index.tsx"
try:
    with open(path, "r", encoding="utf-8") as f:
        f.read()
    print("Encoding is valid UTF-8")
except UnicodeDecodeError:
    print("Encoding is NOT UTF-8, attempting fix...")
    try:
        with open(path, "r", encoding="utf-16") as f:
            content = f.read()
        content = content.replace('\x00', '')
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Fixed encoding.")
    except Exception as e:
        print(f"Failed to fix: {e}")
