import os
import json
import shutil
import re

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
QUARANTINE_DIR = os.path.join(os.path.dirname(SCRIPTS_DIR), "_unused_quarantine", "UK_DATA")

# UK Phone Regex Patterns (Simplified for detection)
# Matches: +44, 07xxx, 01xxx, 02x, 0xxx
UK_PHONE_REGEX = [
    r"(?:\+44|0)7\d{3}\s?\d{6}", # Mobile
    r"(?:\+44|0)1\d{3}\s?\d{5,6}", # Landline
    r"(?:\+44|0)2\d\s?\d{4}\s?\d{4}", # Landline
    r"(?:\+44|0)8\d{2}\s?\d{3}\s?\d{3,4}", # Toll free/premium
]

def ensure_quarantine_dir():
    if not os.path.exists(QUARANTINE_DIR):
        os.makedirs(QUARANTINE_DIR)
        print(f"Created quarantine directory: {QUARANTINE_DIR}")

def is_uk_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check 1: .co.uk domains
        if ".co.uk" in content:
            return True, "Found .co.uk domain"

        # Check 2: UK Phone numbers
        for pattern in UK_PHONE_REGEX:
            if re.search(pattern, content):
                return True, f"Found UK phone pattern: {pattern}"
        
        # Check 3: Explicit Country Strings (Low confidence, but good indicator combined with file name)
        if "United Kingdom" in content:
            return True, "Found 'United Kingdom' string"

    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    
    return False, None

def main():
    ensure_quarantine_dir()
    
    files_moved = 0
    errors = 0

    print(f"Scanning {SCRIPTS_DIR} for UK data violations...")

    for filename in os.listdir(SCRIPTS_DIR):
        if not filename.endswith(".json"):
            continue
            
        file_path = os.path.join(SCRIPTS_DIR, filename)
        
        is_uk, reason = is_uk_content(file_path)
        
        if is_uk:
            try:
                # Move file
                shutil.move(file_path, os.path.join(QUARANTINE_DIR, filename))
                print(f"[MOVED] {filename} -> {reason}")
                files_moved += 1
            except Exception as e:
                print(f"[ERROR] Could not move {filename}: {e}")
                errors += 1

    print(f"\nScan Complete.")
    print(f"Total files quarantined: {files_moved}")
    print(f"Errors: {errors}")

if __name__ == "__main__":
    main()
