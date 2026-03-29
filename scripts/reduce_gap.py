
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Change mb-12 to mb-6
old_p = 'className="text-base text-muted-foreground/80 mb-12 max-w-2xl mx-auto"'
new_p = 'className="text-base text-muted-foreground/80 mb-6 max-w-2xl mx-auto"'

# Change mb-8 to mb-4
old_div = 'className="mb-8"'
new_div = 'className="mb-4"'

if old_p in content:
    content = content.replace(old_p, new_p)
    print("Tagline margin reduced.")

if old_div in content:
    content = content.replace(old_div, new_div)
    print("Chatbot container margin reduced.")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)
