
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add a small margin back to the tagline so it doesn't touch the chatbot
content = content.replace('className="text-base text-muted-foreground/80 mb-0 max-w-2xl mx-auto"', 'className="text-base text-muted-foreground/80 mb-2 max-w-2xl mx-auto"')

# 2. Remove the negative margin entirely
content = content.replace('-mt-16 ', '')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Spacing fixed: Overlap removed.")
