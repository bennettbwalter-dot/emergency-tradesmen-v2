import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

old_text = """24/7 verified plumbers, electricians, locksmiths & gas engineers.

                  Fast response across the UK. No call-out fee if we can't help."""

new_text = """Find trusted local emergency tradespeople fast.
                  Describe your emergency or search and call immediately."""

# The formatting in the file might have different spacing or newlines
# Let's use a more robust replacement by finding the portion of the strings
if old_text in content:
    content = content.replace(old_text, new_text)
    print("Exact match replaced.")
else:
    # Try alternate spacing if exact match fails
    import re
    pattern = r"24/7 verified plumbers, electricians, locksmiths & gas engineers\.\s+Fast response across the UK\. No call-out fee if we can't help\."
    new_content = re.sub(pattern, new_text, content, flags=re.MULTILINE)
    if new_content != content:
        content = new_content
        print("Regex match replaced.")
    else:
        print("Could not find the text to replace.")
        exit(1)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Tagline updated successfully.")
