
import os
import re

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

# Attempt to remove the block using a flexible regex to account for the many empty lines
pattern = r'<motion\.div\s+initial=\{\{ opacity: 0, y: 20 \}\}(?:\s*)animate=\{\{ opacity: 1, y: 0 \}\}(?:\s*)transition=\{\{ duration: 0\.6, delay: 0\.6 \}\}(?:\s*)className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm"(?:\s*)>[\s\S]*?<\/motion\.div>'

new_content = re.sub(pattern, '', content)

if new_content != content:
    print("Trust items removed successfully.")
else:
    # Fallback to a simpler string match if the complex one fails due to line breaks
    # Based on the view_file output, we can try to find the distinctive spans
    print("Regex match failed, trying fallback...")
    
    # We'll just look for the specific strings and remove their parent motion.div
    # Actually, let's just use the line numbers from the last view_file if possible, 
    # but line numbers might have shifted.
    
    # Let's try matching the inner content specifically
    inner_content_snippet = "30-60 min response"
    if inner_content_snippet in content:
        # We'll find the start of the motion.div before it and the end after it
        start_marker = 'className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm"'
        # Find the last occurrence before our snippet
        idx = content.find(inner_content_snippet)
        start_idx = content.rfind('<motion.div', 0, idx)
        end_idx = content.find('</motion.div>', idx) + len('</motion.div>')
        
        if start_idx != -1 and end_idx != -1:
            content = content[:start_idx] + content[end_idx:]
            new_content = content
            print("Trust items removed via fallback.")

with open(index_path, "w", encoding="utf-8") as f:
    f.write(new_content)
