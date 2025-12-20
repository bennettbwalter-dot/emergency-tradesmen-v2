
import os

chat_path = r"..\src\components\EmergencyChatInterface.tsx"

with open(chat_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if '{/* Animated Gold Rim */}' in line:
        skip = True
        continue
    if skip and '</div>' in line and 'transition-opacity duration-500`}>' in lines[lines.index(line)-1]:
        # This is a bit risky with indexing. Let's use a better match.
        pass
    
    # Better approach: string search and replace blocks
    new_lines.append(line)

content = "".join(new_lines)

# Define the block to remove
block_to_remove = """                        {/* Animated Gold Rim */}
                        <div className={`absolute -inset-[2px] rounded-full overflow-hidden ${input.length === 0 ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[500%] bg-[conic-gradient(from_0deg,transparent_0%,hsl(var(--gold)/0.8)_8%,transparent_15%)] animate-spin-slow blur-sm"></div>
                        </div>"""

if block_to_remove in content:
    content = content.replace(block_to_remove, "")
    print("Animated Gold Rim removed.")
else:
    # Try with slightly different whitespace if needed, but it should match our view_file
    import re
    # Fallback to a regex that handles potential whitespace variations
    pattern = r'\{\/\* Animated Gold Rim \*\/\}[\s\S]*?<\/div>[\s\S]*?<\/div>'
    # We need to be careful not to remove too many divs.
    # The block has two closing divs.
    content = content.replace('{/* Animated Gold Rim */}', 'REMOVE_ME_START')
    # Actually let's just use a simpler replacement
    content = re.sub(r'\{\/\* Animated Gold Rim \*\/\}[\s\S]*?transition-opacity duration-500`\}>\s*<div[\s\S]*?<\/div>\s*<\/div>', '', content)
    print("Animated Gold Rim removed via regex.")

with open(chat_path, "w", encoding="utf-8") as f:
    f.write(content)
