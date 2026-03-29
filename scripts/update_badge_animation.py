
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Target element
old_span = '<span className="text-sm font-medium uppercase tracking-wider text-gold animate-pulse">Tradespeople Available Now</span>'
# New element with color animation
new_span = '<motion.span animate={{ color: ["#FFFFFF", "#D4AF37"] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }} className="text-sm font-medium uppercase tracking-wider">Tradespeople Available Now</motion.span>'

if old_span in content:
    content = content.replace(old_span, new_span)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Animation updated successfully.")
else:
    print("Target span not found. Checking for variations...")
    # Try a slightly more relaxed match if the exact string fails
    import re
    p = r'<span[^>]+text-gold animate-pulse[^>]*>Tradespeople Available Now</span>'
    if re.search(p, content):
        content = re.sub(p, new_span, content)
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Animation updated using regex.")
    else:
        print("Could not find the target element.")
