import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Step 1: Check if framer-motion is already imported
if 'import { motion } from "framer-motion"' not in content:
    # Add framer-motion import after React import
    content = re.sub(
        r'(import.*from "react";)',
        r'\1\nimport { motion } from "framer-motion";',
        content,
        count=1
    )
    print("✅ Added framer-motion import")
else:
    print("✓ framer-motion already imported")

# Step 2: Replace the availability indicator with master style
old_indicator = r'''<span className="relative flex h-2 w-2">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 \${isLive \? 'duration-75' : ''}`}></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                              </span>
                             {isLive \? "Live Now" : "Available Now"}'''

new_indicator = '''<span className="relative flex h-2 w-2">
                                  <motion.span
                                      animate={{ backgroundColor: ["#22C55E", "#EF4444"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                  />
                                  <motion.span
                                      animate={{ backgroundColor: ["#22C55E", "#EF4444"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="relative inline-flex rounded-full h-2 w-2"
                                  />
                              </span>
                              <motion.span
                                  animate={{ color: ["#FFFFFF", "#D4AF37"] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                                  className="text-xs font-medium uppercase tracking-wider"
                              >
                                  {isLive ? "Live Now" : "Available Now"}
                              </motion.span>'''

content = re.sub(old_indicator, new_indicator, content, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("✅ Updated availability indicator with master style")
print("✅ Added color transitions: green→red for dot/ring, white→gold for text")
