
import os
import re

scripts_to_fix = [
    "scripts/insert_phase3_tier2.py",
    "scripts/insert_phase3_tier3.py",
    "scripts/insert_phase4_tier2.py",
    "scripts/insert_phase4_tier3.py",
    "scripts/insert_phase5_tier2.py",
    "scripts/insert_phase5_tier3.py"
]

base_dir = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen"

for script_rel_path in scripts_to_fix:
    script_path = os.path.join(base_dir, script_rel_path)
    
    if not os.path.exists(script_path):
        print(f"Skipping: {script_rel_path}")
        continue
        
    print(f"Patching {script_rel_path}...")
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Regex to remove "description": "...", 
        # Accounts for potential whitespace and trailing comma
        new_content = re.sub(r'"description":\s*".*?",\s*', '', content)
        new_content = re.sub(r"'description':\s*'.*?',\s*", "", new_content)

        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print("  - Fixed.")
        
    except Exception as e:
        print(f"  ! Error: {e}")

print("All scripts patched.")
