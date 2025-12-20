
import os

chat_path = r"..\src\components\EmergencyChatInterface.tsx"

with open(chat_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove the gradient background from the input area
content = content.replace('bg-gradient-to-t from-background/90 to-transparent', 'bg-transparent')

with open(chat_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Chat interface gradient removed for transparency.")
