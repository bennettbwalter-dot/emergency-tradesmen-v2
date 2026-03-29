
import os
import glob

# Pattern to match all the relevant insertion scripts
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
        print(f"Skipping (not found): {script_rel_path}")
        continue
        
    print(f"Patching {script_rel_path}...")
    
    try:
        with open(script_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace 'business_name' with 'name'
        # We need to be careful not to replace it if it's just a variable name, 
        # but in my scripts I constructed dicts like {"business_name": "..."}
        # which becomes {"name": "..."}
        
        new_content = content.replace('"business_name":', '"name":')
        new_content = new_content.replace("'business_name':", "'name':")
        
        # Also replace the print statement usage: b['business_name'] -> b['name']
        new_content = new_content.replace("b['business_name']", "b['name']")
        new_content = new_content.replace('b["business_name"]', 'b["name"]')

        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        print("  - Fixed.")
        
    except Exception as e:
        print(f"  ! Error patching {script_rel_path}: {e}")

print("All scripts patched.")
