
import os
import re

path = "../src/components/EmergencyChatInterface.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# The specific block to remove:
# <div className={`absolute -inset-[2px] rounded-full overflow-hidden ${input.length === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
#     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[500%] bg-[conic-gradient(from_0deg,transparent_0%,hsl(var(--gold)/0.8)_8%,transparent_15%)] animate-spin-slow blur-sm"></div>
# </div>

pattern = r'<div className={`absolute -inset-\[2px\] rounded-full overflow-hidden \${input\.length === 0 \? \'opacity-100\' : \'opacity-0\'\} transition-opacity duration-500`}>[\s\S]*?<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-\[200%\] h-\[500%\] bg-\[conic-gradient\(from_0deg,transparent_0%,hsl\(var\(--gold\)/0\.8\)_8%,transparent_15%\)\] animate-spin-slow blur-sm"></div>[\s\S]*?</div>'

new_content = re.sub(pattern, '', content)

if new_content != content:
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Removed yellow blob from EmergencyChatInterface.tsx")
else:
    print("Could not find the blob pattern in EmergencyChatInterface.tsx")
