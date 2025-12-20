import os

file_path = os.path.join('..', 'src', 'components', 'BusinessCard.tsx')

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found")
    exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Basic brace balance check
open_braces = content.count('{')
close_braces = content.count('}')
open_parens = content.count('(')
close_parens = content.count(')')

print(f"--- BusinessCard.tsx Verification ---")
print(f"Braces: {open_braces}/{close_braces}, Parens: {open_parens}/{close_parens}")

if open_braces != close_braces:
    print("WARNING: Unbalanced braces!")
if open_parens != close_parens:
    print("WARNING: Unbalanced parens!")

# Check for specific strings added
if 'isPremium' in content:
    print("SUCCESS: isPremium logic found")
if 'emerald' in content:
    print("SUCCESS: Emerald color classes found")
if 'Verified Partner' in content:
    print("SUCCESS: Verified Partner text found")

print("Verification complete.")
