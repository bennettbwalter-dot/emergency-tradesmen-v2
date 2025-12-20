
import os
import re

def find_contextual_glows(file_path, patterns):
    if not os.path.exists(file_path):
        return
    print(f"\n--- {file_path} ---")
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        for pattern in patterns:
            if re.search(pattern, line):
                print(f"[{i+1}] {line.strip()}")
                # Print 2 lines before and after
                #for j in range(max(0, i-2), min(len(lines), i+3)):
                #    if j != i:
                #        print(f"  {j+1}: {lines[j].strip()}")

patterns = [r'bg-gold', r'glow', r'blob', r'conic-gradient', r'blur']
find_contextual_glows("../src/pages/Index.tsx", patterns)
find_contextual_glows("../src/components/EmergencyChatInterface.tsx", patterns)
