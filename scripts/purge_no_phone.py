"""
Purge any UK/US business listings that have a null or empty phone number.
These violate the core data integrity rule: every listing must have a valid phone number.
"""
import requests
import re

env_content = open('.env.uk.local').read()
url = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', env_content).group(1)
key = re.search(r'SUPABASE_SERVICE_ROLE_KEY\s*=\s*([^\s]+)', env_content).group(1)

read_headers = {'apikey': key, 'Authorization': f'Bearer {key}'}
write_headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json', 'Prefer': 'return=minimal'}

# --- Find all listings with null phone ---
print("Scanning for listings with NULL phone numbers...")
bad_ids = []
offset = 0
batch = 1000

while True:
    r = requests.get(
        f'{url}/rest/v1/businesses',
        params={'phone': 'is.null', 'select': 'id,name,city,trade,country_code', 'limit': batch, 'offset': offset},
        headers=read_headers
    )
    data = r.json()
    if not isinstance(data, list):
        print(f'Error: {data}')
        break
    if not data:
        break
    for b in data:
        bad_ids.append(b['id'])
        print(f"  BAD: [{b['country_code']}] {b['name']} | {b['city']} | {b['trade']}")
    if len(data) < batch:
        break
    offset += batch

# Also find empty string phone
offset = 0
while True:
    r = requests.get(
        f'{url}/rest/v1/businesses',
        params={'phone': 'eq.', 'select': 'id,name,city,trade,country_code', 'limit': batch, 'offset': offset},
        headers=read_headers
    )
    data = r.json()
    if not isinstance(data, list) or not data:
        break
    for b in data:
        if b['id'] not in bad_ids:
            bad_ids.append(b['id'])
            print(f"  BAD (empty): [{b['country_code']}] {b['name']} | {b['city']} | {b['trade']}")
    if len(data) < batch:
        break
    offset += batch

print(f"\nTotal listings with no phone number: {len(bad_ids)}")

if bad_ids:
    confirm = input(f"Delete all {len(bad_ids)} phone-less listings? (yes/no): ")
    if confirm.strip().lower() == 'yes':
        deleted = 0
        for bid in bad_ids:
            dr = requests.delete(
                f'{url}/rest/v1/businesses?id=eq.{bid}',
                headers=write_headers
            )
            if dr.status_code in [200, 204]:
                deleted += 1
            else:
                print(f"  Failed to delete {bid}: {dr.text}")
        print(f"Deleted {deleted}/{len(bad_ids)} phone-less listings.")
    else:
        print("Deletion cancelled.")
else:
    print("All listings have phone numbers. Data integrity confirmed.")
