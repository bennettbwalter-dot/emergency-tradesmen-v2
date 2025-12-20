
import os
import re

path = "../src/pages/Index.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update Tagline (Case change)
content = content.replace("When You Need Them Most", "When you need them most")

# 2. Update Description
# Match strict or loose
if "24/7 verified plumbers, electricians, locksmiths & gas engineers." in content:
    content = content.replace(
        "24/7 verified plumbers, electricians, locksmiths & gas engineers.", 
        "Find local emergency help and call now."
    )
else:
    # Fallback if I missed a char
    print("Could not find exact description string to replace.")

# 3. Fix Title artifact (Ã”Ã‡Ã´ -> -)
# Usage: <title>Emergency Tradesmen UK Ã”Ã‡Ã´ ...
# Usage: <meta property="og:title" ...
# Regex replace
content = re.sub(r"Emergency Tradesmen UK .*? 24/7 Plumbers", "Emergency Tradesmen UK - 24/7 Plumbers", content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated Index.tsx text content")
