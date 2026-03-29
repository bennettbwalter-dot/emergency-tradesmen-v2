import os
import re

path = "../src/components/BusinessCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the availability indicator section more flexibly
# Look for the pattern with the green-500 spans and "Available Now" text

pattern = r'(<span className="relative flex h-2 w-2">)\s*<span className=\{`animate-ping[^>]*bg-green-500[^>]*>\s*</span>\s*<span className="relative inline-flex[^>]*bg-green-500[^>]*>\s*</span>\s*</span>\s*\{isLive \? "Live Now" : "Available Now"\}'

replacement = '''<span className="relative flex h-2 w-2">
                                  <motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                  />
                                  <motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="relative inline-flex rounded-full h-2 w-2"
                                  />
                              </span>
                              <motion.span
                                  animate={{ color: ["#D4AF37", "#FFFFFF"] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                              >
                                  {isLive ? "Live Now" : "Available Now"}
                              </motion.span>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)

if new_content != content:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("✅ Successfully replaced availability indicator with animations")
    print("  - Dot/Ring: Red → Green")
    print("  - Text: Gold → White")
else:
    print("⚠️ Pattern not found - trying alternative approach...")
    
    # Alternative: Just replace the specific parts
    # Replace the green-500 spans
    content = re.sub(
        r'<span className=\{`animate-ping[^>]*bg-green-500[^>]*>\s*</span>',
        '''<motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                                  />''',
        content
    )
    
    content = re.sub(
        r'<span className="relative inline-flex[^>]*bg-green-500[^>]*>\s*</span>',
        '''<motion.span
                                      animate={{ backgroundColor: ["#EF4444", "#22C55E"] }}
                                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                                      className="relative inline-flex rounded-full h-2 w-2"
                                  />''',
        content
    )
    
    # Wrap the text in motion.span
    content = re.sub(
        r'\{isLive \? "Live Now" : "Available Now"\}',
        '''<motion.span
                                  animate={{ color: ["#D4AF37", "#FFFFFF"] }}
                                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                              >
                                  {isLive ? "Live Now" : "Available Now"}
                              </motion.span>''',
        content
    )
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("✅ Applied animations using alternative approach")
