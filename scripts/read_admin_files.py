import os

admin_dir = os.path.join('..', 'src', 'pages', 'admin')
files = [
    'Dashboard.tsx',
    'Businesses.tsx',
    'Photos.tsx',
    'Reviews.tsx',
    'Quotes.tsx',
    'Subscriptions.tsx',
    'Availability.tsx',
    'ProfileEditor.tsx'
]

for file in files:
    path = os.path.join(admin_dir, file)
    if os.path.exists(path):
        print(f"--- {file} ---")
        with open(path, 'r', encoding='utf-8') as f:
            print(f.read())
        print("\n\n")
    else:
        print(f"--- {file} NOT FOUND ---")
