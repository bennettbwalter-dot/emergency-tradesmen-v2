
import os

chat_path = r"..\src\components\EmergencyChatInterface.tsx"

with open(chat_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the spinning beam block
import re
# Match the block exactly as seen in the latest view_file
pattern = r'<div className={`absolute -inset-\[2px\] rounded-full overflow-hidden \$\{input\.length === 0 \? \'opacity-100\' : \'opacity-0\'\} transition-opacity duration-500`\}>\s*<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-\[200%\] h-\[500%\] bg-\[conic-gradient\(from_0deg,transparent_0%,hsl\(var\(--gold\)/0.8\)_8%,transparent_15%\)\] animate-spin-slow blur-sm"><\/div>\s*<\/div>'

content = re.sub(pattern, '', content)

# Also remove the hover glow just in case it's what they mean by "blob"
content = content.replace('<div className="absolute -inset-0.5 bg-gradient-to-r from-gold/30 to-gold/10 rounded-full opacity-0 group-hover:opacity-100 transition duration-500 blur-md"></div>', '')

with open(chat_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Spinning beam and hover glow removed.")
