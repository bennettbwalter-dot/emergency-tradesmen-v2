
path = "../src/lib/trades.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if 'slug: "breakdown"' not in content:
    # Find the closing bracket of the trades array
    # The trades array ends with "] as const;"
    pos = content.find("] as const;")
    if pos != -1:
        insertion = '  { slug: "breakdown", name: "Breakdown Recovery", icon: "🚗" },\n'
        content = content[:pos] + insertion + content[pos:]
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Added Breakdown Recovery to trades.ts")
    else:
        print("Could not find insertion point ] as const;")
else:
    print("Breakdown already exists")
