
import os
import binascii

filepath = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\public\emergency-water-damage.jpg"

if not os.path.exists(filepath):
    print("Error: File does not exist.")
    exit(1)

size = os.path.getsize(filepath)
print(f"File Size: {size} bytes")

if size == 0:
    print("Error: File is empty.")
    exit(1)

with open(filepath, 'rb') as f:
    header = f.read(4)
    hex_header = binascii.hexlify(header).upper()
    print(f"Header Bytes: {hex_header}")
    
    # JPEG magic bytes: FF D8 FF
    if hex_header.startswith(b'FFD8'):
        print("Success: Valid JPEG header detected.")
    else:
        print("Error: Invalid JPEG header.")
