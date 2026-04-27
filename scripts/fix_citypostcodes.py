"""
Fix cityPostcodes.ts: the borough entries were injected INSIDE the
getPostcodeForCity function instead of inside the cityPostcodes object.
This script moves them back to the correct place.
"""

filepath = "src/lib/cityPostcodes.ts"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Split at the closing }; of the object
# Everything from "    // --- DECONSTRUCTED MAJOR CITIES ---" to the stray closing "}" at line 582
# needs to come out of the function and go back into the object.

# 1. Remove the orphaned block from inside the function
orphan_start = "\n    // --- DECONSTRUCTED MAJOR CITIES ---"
orphan_end = '    "Cwmbran (Cardiff)": "NP44 1AA",\n}'

# Find and extract the orphaned block
start_idx = content.find(orphan_start)
end_idx = content.find(orphan_end) + len(orphan_end)

if start_idx == -1:
    print("ERROR: Could not find orphan block start.")
    exit(1)

orphan_block = content[start_idx:end_idx]

# Strip the stray closing brace from the orphan (the final \n} is the function's closing brace confusion)
# Actually the block ends with the last Cardiff entry + a lone }
# We want to keep the entries but remove them from this position
content_without_orphan = content[:start_idx] + "\n" + content[end_idx:]

# 2. Insert the borough entries into the cityPostcodes object (before its closing };)
# The object closing is: "};\n\nexport function"
object_close = "};\n\nexport function"
insert_pos = content_without_orphan.find(object_close)

if insert_pos == -1:
    print("ERROR: Could not find object closing.")
    exit(1)

# Build the clean borough block (strip the trailing lone } that was the orphan end marker)
clean_borough_block = orphan_block.rstrip()
# Remove the final lone } if present
if clean_borough_block.endswith("}"):
    clean_borough_block = clean_borough_block[:-1].rstrip()
clean_borough_block += "\n"

# Insert before the closing };
new_content = (
    content_without_orphan[:insert_pos]
    + clean_borough_block
    + content_without_orphan[insert_pos:]
)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Fixed! Borough entries are now inside the cityPostcodes object.")
