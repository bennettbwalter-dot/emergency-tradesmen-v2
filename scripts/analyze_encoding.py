import os
import re

file_path = r"c:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\src\pages\BlogPostPageFix.tsx"

with open(file_path, 'rb') as f:
    raw_data = f.read()

# Find non-ASCII sequences
# A non-ASCII sequence is any byte >= 128
non_ascii_sequences = re.findall(rb'[\x80-\xff]+', raw_data)

unique_sequences = set(non_ascii_sequences)

print(f"File size: {len(raw_data)} bytes")
print(f"Found {len(non_ascii_sequences)} non-ASCII sequences.")
print("\nUnique sequences (Hex):")
for seq in unique_sequences:
    try:
        decoded = seq.decode('utf-8')
    except:
        decoded = "DECODE_ERROR"
    print(f"{seq.hex()} -> {decoded}")

# Also find where they are in the file (roughly)
print("\nSample occurrences:")
for seq in list(unique_sequences)[:10]:
    pos = raw_data.find(seq)
    context = raw_data[max(0, pos-20):pos+len(seq)+20]
    print(f"Hex {seq.hex()}: ... {context} ...")
