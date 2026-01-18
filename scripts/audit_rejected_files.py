
import os
import json
import re

SCRIPTS_DIR = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\scripts"

# Same check as before
def is_uk_phone(phone_str):
    if not phone_str: return False
    clean = re.sub(r'[^0-9+]', '', phone_str)
    if clean.startswith('+44'): return True
    if clean.startswith('07'): return True 
    if clean.startswith('01'): return True 
    if clean.startswith('02'): return True 
    if clean.startswith('08'): return True 
    if clean.startswith('03'): return True 
    return False

print("Auditing REJECTED *_real.json files...")

files = [f for f in os.listdir(SCRIPTS_DIR) if f.endswith('_real.json')]
rejected_samples = []

for fname in files:
    fpath = os.path.join(SCRIPTS_DIR, fname)
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if not isinstance(data, list) or not data: continue
        
        first = data[0]
        phone = first.get('phone', '')
        
        if not is_uk_phone(phone):
            rejected_samples.append({
                "file": fname,
                "phone": phone,
                "name": first.get('name')
            })
            
    except:
        pass

print(f"Total Rejected: {len(rejected_samples)}")
print("Sample of 20 Rejected:")
for item in rejected_samples[:20]:
    print(f"  {item['file']} -> {item['phone']} ({item['name']})")
