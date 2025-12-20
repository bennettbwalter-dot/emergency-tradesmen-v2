
import os

path = "../src/components/EmergencyChatInterface.tsx"
if not os.path.exists(path):
    print(f"Error: {path} not found")
    exit(1)

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Target code block
old_code = """    useEffect(() => {
        // Stop typing if user is interacting
        if (isFocused || input.trim().length > 0) {
            return;
        }"""

new_code = """    useEffect(() => {
        // Stop typing only if user has entered text
        if (input.trim().length > 0) {
            return;
        }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully fixed auto-typing placeholder logic.")
else:
    print("Could not find the target code block in EmergencyChatInterface.tsx")
    # Try a slightly more flexible match if exact match fails
    if 'if (isFocused || input.trim().length > 0)' in content:
         content = content.replace('if (isFocused || input.trim().length > 0)', 'if (input.trim().length > 0)')
         with open(path, "w", encoding="utf-8") as f:
            f.write(content)
         print("Successfully fixed auto-typing placeholder logic (flexible match).")
    else:
         print("Flexible match also failed.")
