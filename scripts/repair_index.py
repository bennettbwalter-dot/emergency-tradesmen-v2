import os

index_path = r"..\src\pages\Index.tsx"

with open(index_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# Reconstruct the full box code first (from line 550 to 605 of the broken file)
# Wait, let's just find the markers.
box_marker = "{/* Visibility Into Call-Outs Box for Tradesmen */}"

# Find all occurrences
occurrences = []
for i, line in enumerate(lines):
    if box_marker in line:
        occurrences.append(i)

if len(occurrences) != 2:
    print(f"Expected 2 occurrences of box marker, found {len(occurrences)}")
    exit(1)

# The second one is the "tail" of the original box.
# Let's find where it ends.
# The box ends with </div>\n              </div>
# Or similar.
tail_start = occurrences[1]
tail_end = -1
for i in range(tail_start, len(lines)):
    if "AvailabilityCarousel" in lines[i]:
        # The box should end before this.
        # Looking at previous view_file, line 605 was the end.
        # Let's search backwards from AvailabilityCarousel for the closing divs.
        for j in range(i-1, tail_start, -1):
            if "</div>" in lines[j]:
                # We need to find the correct closing div.
                # The box had: 
                # <div ...> (Main)
                #   <div ...> (Grid)
                #     <div ...> (Left)
                #       <ul>
                #     ...
                #     <div ...> (Right)
                #   </div> (Main closing)
                # Wait, looking at line 605 in index_broken.txt:
                # 605:               </div>
                # 606: 
                # 607:                 <div className="mb-8 -mx-6 md:mx-auto max-w-4xl">
                # 608: 
                # 609:                   <AvailabilityCarousel />
                tail_end = j + 1
                break
        break

if tail_end == -1:
    print("Could not find end of tail box.")
    exit(1)

full_box_lines = lines[tail_start:tail_end]

# The first occurrence is the broken one at the top.
# It starts at occurrences[0]-1 (the container-wide div I added)
head_start = occurrences[0] - 1
head_end = -1
# It ends at line 485 in index_broken.txt:
# 485:           </div>
# 486: 
# 487: {/* CTA Section */}
for i in range(head_start, len(lines)):
    if "{/* CTA Section */}" in lines[i]:
        head_end = i
        break

if head_end == -1:
    print("Could not find end of head box.")
    exit(1)

# Now rebuild the file
new_lines = []
# 1. Everything before the first broken box
new_lines.extend(lines[:head_start])

# 2. Add the full box in its new location
new_lines.append('          <div className="container-wide pt-12">\n')
new_lines.extend(full_box_lines)
new_lines.append('          </div>\n\n')

# 3. Everything between the two boxes (CTA section start)
new_lines.extend(lines[head_end:tail_start])

# 4. Everything after the second box
new_lines.extend(lines[tail_end:])

with open(index_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Successfully repaired Index.tsx and moved the box.")
