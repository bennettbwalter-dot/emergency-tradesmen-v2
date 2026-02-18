import os

file_path = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\pages\BlogPostPageFix.tsx"

targets = [
    "Ô£à",
    "├ö┬ú├á",
    "✅"
]

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for target in targets:
    content = content.replace(target, "")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleanup complete.")
