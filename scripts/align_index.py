
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Change max-w-4xl to max-w-2xl for the chatbot container
content = content.replace('max-w-4xl mx-auto mb-2 animate-in', 'max-w-2xl mx-auto mb-2 animate-in')

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Index.tsx aligned.")
