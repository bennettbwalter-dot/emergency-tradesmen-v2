
import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Target area: the dot structure
old_dot_structure = """<span className="relative flex h-2 w-2">

                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>

                    <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>

                  </span>"""

# If the above exact block isn't found (due to whitespace or minor differences), I'll use a regex
import re

# New dot structure with green/red slow flash
# Using Framer Motion for the continuous color cycle
new_dot_structure = """<span className="relative flex h-2 w-2">
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
                  </span>"""

# Try exact find first
if old_dot_structure in content:
    content = content.replace(old_dot_structure, new_dot_structure)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Dot animation updated successfully.")
else:
    # Use regex to find the spans inside the relative flex h-2 w-2
    pattern = r'<span className="relative flex h-2 w-2">.*?<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>.*?<span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>.*?</span>'
    content = re.sub(pattern, new_dot_structure, content, flags=re.DOTALL)
    with open(index_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Dot animation updated using regex.")
