
import os
import re

path = "../src/pages/Index.tsx"
if os.path.exists(path):
    print(f"\n--- {path} ---")
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    patterns = [r'bg-gold', r'glow', r'blob', r'conic-gradient', r'blur']
    for i, line in enumerate(lines):
        for pattern in patterns:
            if re.search(pattern, line):
                print(f"[{i+1}] {line.strip()}")
else:
    print(f"File not found: {path}")
