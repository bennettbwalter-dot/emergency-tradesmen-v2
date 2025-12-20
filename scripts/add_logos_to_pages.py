import os
import re

# NotFound.tsx - Add logo above the 404 text
notfound_path = "../src/pages/NotFound.tsx"
with open(notfound_path, "r", encoding="utf-8") as f:
    content = f.read()

if 'et-logo-new.png' not in content:
    # Add logo import if needed (Link is already imported)
    content = content.replace(
        '    <div className="text-center">',
        '''    <div className="text-center">
        <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-20 h-20 mx-auto mb-6 rounded-full object-cover border-2 border-gold/50" />'''
    )
    
    with open(notfound_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Added logo to NotFound.tsx")
else:
    print("✓ Logo already in NotFound.tsx")

# AuthPage.tsx - Add logo above the card
authpage_path = "../src/pages/AuthPage.tsx"
with open(authpage_path, "r", encoding="utf-8") as f:
    content = f.read()

if 'et-logo-new.png' not in content:
    # Find the Card component and add logo before it
    content = content.replace(
        '                    <Card className="border-gold/20 shadow-lg">',
        '''                    <div className="flex justify-center mb-6">
                        <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-16 h-16 rounded-full object-cover border-2 border-gold/50" />
                    </div>
                    <Card className="border-gold/20 shadow-lg">'''
    )
    
    with open(authpage_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Added logo to AuthPage.tsx")
else:
    print("✓ Logo already in AuthPage.tsx")

# ContactPage.tsx - Add logo to the page header
contactpage_path = "../src/pages/ContactPage.tsx"
with open(contactpage_path, "r", encoding="utf-8") as f:
    content = f.read()

if 'et-logo-new.png' not in content:
    # Add logo after the opening div
    # Find the return statement and add logo
    content = re.sub(
        r'(return \(\s*<div className="min-h-screen bg-background">)',
        r'''\1
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center mb-6">
                    <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-16 h-16 rounded-full object-cover border-2 border-gold/50" />
                </div>
            </div>''',
        content
    )
    
    with open(contactpage_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Added logo to ContactPage.tsx")
else:
    print("✓ Logo already in ContactPage.tsx")

# About.tsx - Add logo to hero section
about_path = "../src/pages/About.tsx"
with open(about_path, "r", encoding="utf-8") as f:
    content = f.read()

if 'et-logo-new.png' not in content:
    # Find the hero section and add logo
    content = re.sub(
        r'(<div className="flex gap-4">)',
        r'''<div className="flex justify-center mb-6">
                                    <img src="/et-logo-new.png" alt="Emergency Trades Logo" className="w-20 h-20 rounded-full object-cover border-2 border-gold/50" />
                                </div>
                                \1''',
        content,
        count=1
    )
    
    with open(about_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✓ Added logo to About.tsx")
else:
    print("✓ Logo already in About.tsx")

print("\n✅ Logo distribution complete!")
