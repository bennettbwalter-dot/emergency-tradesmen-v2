
import os

source = "../scripts/index_temp.tsx"
dest = "recovered_index_final.tsx"

# The file has UTF-8 BOM: ef bb bf
# But the content is "MojiBake": UTF-16 bytes read as UTF-8 characters.
# We need to:
# 1. Read as UTF-8 (handling the CJK chars)
# 2. Get the ordinal values of chars? Or encode back to bytes?
# Actually, the file on disk IS UTF-8 bytes that REPRESENT the CJK chars.
# e.g. E6 B5 A9 is '浩'.
# '浩' in UTF-16LE is 69 6D (Wait. 69 6D is 'im' of import?)
# Let's check: '浩' (U+6D69). 6D 69.
# 'im' is 69 6D.
# So UTF-16LE 'i' (69 00) 'm' (6D 00)? No.
# UTF-16LE 'import' = 69 00 6D 00 70 00 ...
# If interpreted as UTF-8?
# 69 00 -> i (and null).
# But here we have E6...
# Warning: The file might have been saved as UTF-8 *containing* the CJK chars.
# So we read as UTF-8 -> Get String "浩..."
# Encode String to UTF-16LE? No.
# value of '浩' is 0x6D69.
# So we take ord('浩') -> 0x6D69.  HI=6D LO=69.
# That gives 'mi' ? 
# or 'im'?
# import = i (0x69) m (0x6d).
# So 0x6d69 is 'mi' (little endian 69 6D).
# So: Read UTF-8 -> Get Unicodes -> Pack into bytes (Little Endian) -> Decode as ASCII.

try:
    with open(source, "r", encoding="utf-8") as f:
        text = f.read()

    # Remove BOM char if present (ZERO WIDTH NO-BREAK SPACE)
    if text.startswith('\ufeff'):
        text = text[1:]

    # Pack chars back to bytes
    # Each char represents 2 bytes of the original file?
    # '浩' = 0x6D69.
    # We want bytes b'\x69\x6d'. (im)
    
    out_bytes = bytearray()
    for char in text:
        val = ord(char)
        # Assuming original was UTF-16LE:
        # 0x6D69 -> 69 6D
        lo = val & 0xFF
        hi = (val >> 8) & 0xFF
        out_bytes.append(lo)
        out_bytes.append(hi)

    # Now decode these bytes as UTF-8 (the original source code)
    recovered = out_bytes.decode('utf-8')
    
    # Check
    if "import" in recovered:
        print("Recovered!")
        with open(dest, "w", encoding="utf-8") as f:
            f.write(recovered)
    else:
        print("Decoded but check failed:")
        print(recovered[:50])

except Exception as e:
    print(e)
