import os

files = [
    os.path.join('..', 'src', 'components', 'admin', 'AdminLayout.tsx'),
    os.path.join('..', 'src', 'pages', 'admin', 'Dashboard.tsx'),
    os.path.join('..', 'src', 'pages', 'admin', 'Subscriptions.tsx'),
    os.path.join('..', 'src', 'pages', 'admin', 'Businesses.tsx'),
    os.path.join('..', 'src', 'lib', 'subscriptionService.ts')
]

for f_path in files:
    if not os.path.exists(f_path):
        print(f"MISSING: {f_path}")
        continue
    
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Basic brace balance check
    open_braces = content.count('{')
    close_braces = content.count('}')
    open_parens = content.count('(')
    close_parens = content.count(')')
    
    print(f"--- {os.path.basename(f_path)} ---")
    print(f"Braces: {open_braces}/{close_braces}, Parens: {open_parens}/{close_parens}")
    
    if open_braces != close_braces:
        print("WARNING: Unbalanced braces!")
    if open_parens != close_parens:
        print("WARNING: Unbalanced parens!")

print("Verification complete.")
