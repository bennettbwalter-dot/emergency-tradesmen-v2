import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find and replace the entire availability indicator section with a clean, properly formatted version
# Look for the section starting with "relative flex h-2 w-2" and ending with the closing span and text

old_pattern = r'<span className="relative flex h-2 w-2">.*?{isLive \? "Live Now" : "Available Now"}.*?</motion\.span>'

new_indicator = '''<span className="relative flex h-2 w-2">
                                  <motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                      style={{ backgroundColor: "#EF4444" }}
                                  />
                                  <motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="relative inline-flex rounded-full h-2 w-2"
                                      style={{ backgroundColor: "#EF4444" }}
                                  />
                              </span>
                              <motion.span
                                  animate={{ color: ["#D4AF37", "#FFFFFF"] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                                  style={{ color: "#D4AF37" }}
                              >
                                  {isLive ? "Live Now" : "Available Now"}
                              </motion.span>'''

new_content = re.sub(old_pattern, new_indicator, content, flags=re.DOTALL)

if new_content != content:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Rewrote availability indicators with clean formatting")
else:
    print("⚠️ Pattern not found, trying manual line-by-line approach...")
    # If regex doesn't work, we'll need to manually edit the specific lines

with open(path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("✅ Availability indicators updated")
