
import os
import re

path = "../src/components/BookingModal.tsx"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace specific Revolut occurrences
    # "Pay with Revolut" -> "Pay with Stripe"
    content = content.replace("Pay with Revolut", "Pay with Stripe")
    content = content.replace("Revolut", "Stripe")
    
    # Remove/Replace Revolut links if present (revolut.me)
    # Regex for revolut.me link
    content = re.sub(r'https?://(www\.)?revolut\.me/[^\s"]+', '#', content)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print("Replaced Revolut with Stripe in BookingModal.tsx")
else:
    print("BookingModal.tsx not found")
