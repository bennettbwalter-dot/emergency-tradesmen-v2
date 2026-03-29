
import os

# Files that might contain the payment logic
files = [
    "../src/components/BookingModal.tsx",
    "../src/components/QuoteRequestModal.tsx",
    "../src/pages/BusinessProfilePage.tsx",
    "../src/pages/PricingPage.tsx",
    "../src/pages/Index.tsx",
    "../src/components/Header.tsx",
    "../src/components/Footer.tsx"
]

fixed_count = 0

for path in files:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            
        initial_len = len(content)
        new_content = content
        
        # Replace Text Display
        if "Revolut" in new_content:
            new_content = new_content.replace("Revolut", "Stripe")
            
        # Replace Links
        if "revolut.me" in new_content:
             # Replace link with placeholder or Stripe Config var if I knew it?
             # I'll just remove the link for now to be safe, or set to #
             import re
             new_content = re.sub(r'https?://(www\.)?revolut\.me/[^\s"]+', '#', new_content)
             
        if "revolut" in new_content: # Lowercase
            new_content = new_content.replace("revolut", "stripe")

        if new_content != content:
            print(f"Removed Revolut from: {path}")
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)
            fixed_count += 1

if fixed_count == 0:
    print("No Revolut found in Checked Files. Use Search to find it elsewhere.")
