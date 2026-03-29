
import os

path = "../src/contexts/ChatbotContext.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    new_lines.append(line)
    if 'detectedCity: string | null;' in line and 'isRequestingLocation: boolean;' not in lines[lines.index(line)+1 if lines.index(line)+1 < len(lines) else 0]:
         new_lines.append('    isRequestingLocation: boolean;\n')

with open(path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed ChatbotState interface in ChatbotContext.tsx")
