
import os
source = "../scripts/index_temp.tsx"
with open(source, "rb") as f:
    byte_content = f.read(32)
    print(byte_content)
    print(list(byte_content))
