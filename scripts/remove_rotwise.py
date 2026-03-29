
import os
from supabase import create_client, Client

url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    # Try reading from .env file directly if env vars are missing
    try:
        with open('.env', 'r') as f:
            for line in f:
                if line.startswith('VITE_SUPABASE_URL='):
                    url = line.split('=')[1].strip()
                elif line.startswith('VITE_SUPABASE_ANON_KEY='):
                    key = line.split('=')[1].strip()
    except:
        pass

if not url or not key:
    print("Error: Could not find Supabase credentials")
    exit(1)

supabase: Client = create_client(url, key)

print("Searching for Rotwise in Aberdeen...")

response = supabase.table('businesses') \
    .select("*") \
    .ilike('business_name', '%Rotwise%') \
    .eq('city', 'Aberdeen') \
    .execute()

if response.data:
    print(f"Found {len(response.data)} listings:")
    for b in response.data:
        print(f"- ID: {b['id']}, Name: {b['business_name']}, City: {b['city']}, Trade: {b['trade']}")
        
        # Proceed to delete
        print(f"Deleting listing {b['id']}...")
        del_resp = supabase.table('businesses').delete().eq('id', b['id']).execute()
        print("Deleted.")
else:
    print("No listing found for Rotwise in Aberdeen.")
