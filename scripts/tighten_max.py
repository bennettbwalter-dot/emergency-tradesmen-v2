
import os

index_path = r"..\src\pages\Index.tsx"
chat_interface_path = r"..\src\components\EmergencyChatInterface.tsx"

# 1. Update Index.tsx: Apply negative top margin to the chatbot container and reduce the search gap
with open(index_path, "r", encoding="utf-8") as f:
    index_content = f.read()

# Using a negative margin to pull the chatbot up
index_content = index_content.replace('mb-6 animate-in', 'mb-2 -mt-10 animate-in') 

with open(index_path, "w", encoding="utf-8") as f:
    f.write(index_content)

# 2. Update EmergencyChatInterface.tsx: Reduce top padding
with open(chat_interface_path, "r", encoding="utf-8") as f:
    chat_content = f.read()

# Reduce pt-8 to pt-2 in the chat container
chat_content = chat_content.replace('scrollbar-hide pt-8"', 'scrollbar-hide pt-2"')

with open(chat_interface_path, "w", encoding="utf-8") as f:
    f.write(chat_content)

print("Negative margin applied and internal padding reduced.")
