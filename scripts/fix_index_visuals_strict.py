
import os

path = "../src/pages/Index.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix encoding artifacts
content = content.replace("Ã”Ã‡Ã´", "-")
content = content.replace("â’", "'")

# Add flashing to "Tradespeople Available Now"
if 'Tradespeople Available Now' in content:
    old_span = '<span className="text-sm font-medium uppercase tracking-wider text-gold">Tradespeople Available Now</span>'
    new_span = '<span className="text-sm font-medium uppercase tracking-wider text-gold animate-pulse">Tradespeople Available Now</span>'
    if old_span in content:
        content = content.replace(old_span, new_span)
    else:
        content = content.replace('text-gold">Tradespeople Available Now', 'text-gold animate-pulse">Tradespeople Available Now')

# Apply Round Buttons to HERO BUTTONS ONLY (Targeted)
# "Get Help Now" button
target_class = 'className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold"'
replacement_class = 'className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold rounded-full"'
content = content.replace(target_class, replacement_class)

# "Contact Us" button (if in Hero)
# Look for variant="outline" size="xl"
# In Step 448 it was: <Button variant="outline" size="xl" asChild>
# I'll replace size="xl" with size="xl" className="rounded-full" if it doesn't have class.
# Or if it has a class.
# Step 448: <Link to="/contact" className="flex items-center gap-3">. Button wraps Link.
# The Button has `asChild`. So the styling is on the Button.
# I will replace 'variant="outline" size="xl"' with 'variant="outline" size="xl" className="rounded-full"'
content = content.replace('variant="outline" size="xl"', 'variant="outline" size="xl" className="rounded-full"')

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Applied flashing and targeted button rounding to Index.tsx")
