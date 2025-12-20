
import os

index_path = r"..\src\pages\Index.tsx"
chat_interface_path = r"..\src\components\EmergencyChatInterface.tsx"

# 1. Aggressive negative margin in Index.tsx
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

index_content = index_content.replace('-mt-10', '-mt-24') 

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

# 2. Remove all top padding in EmergencyChatInterface.tsx
with open(chat_interface_path, "r", encoding="utf-8") as f:
    chat_content = f.read()

chat_content = chat_content.replace('scrollbar-hide pt-2"', 'scrollbar-hide pt-0"')

with open(chat_interface_path, "w", encoding="utf-8") as f:
    f.write(chat_content)

print("Spacing tightened aggressively.")
