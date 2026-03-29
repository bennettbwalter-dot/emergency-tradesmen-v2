
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Reduce tagline bottom margin even further
content = content.replace('mb-6 max-w-2xl mx-auto"', 'mb-0 max-w-2xl mx-auto"')

# 2. Reduce the motion.div bottom margin (the container wrapping both chat and search)
content = content.replace('className="mb-4"', 'className="mb-0"')

# 3. Reduce the gap BETWEEN the chatbot and the Search buttons (which I previously set to mb-20)
content = content.replace('mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">', 'mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Spacing tightened further.")
