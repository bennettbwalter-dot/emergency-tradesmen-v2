import os

file_path = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\pages\BlogPostPageFix.tsx"

# Dictionary of corrupted sequences and their correct replacements (or removal)
replacements = {
    "Ô£à": "",
    "├ö┬ú├á": "",
    "✅": "",
    "ÔÇö": "—",
    "ÔÇô": "–",
    "ÔåÆ": "→",
    "┬ú": "£",
    "ÔÜí": "", # Warning icon removal for US cleanliness
    "ÔÜá´©Å": "", # Warning icon variant
}

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

for target, replacement in replacements.items():
    content = content.replace(target, replacement)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Comprehensive cleanup complete.")
