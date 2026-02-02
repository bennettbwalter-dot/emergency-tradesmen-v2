
import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv('.env')
url = os.getenv('VITE_SUPABASE_URL')
key = os.getenv('VITE_SUPABASE_ANON_KEY')

if not url or not key:
    print("Missing credentials")
    exit(1)

supabase = create_client(url, key)

print(f"Connecting to: {url}")
try:
    # Try using PostgREST's introspection
    # We can query a dummy table to see if it works
    res = supabase.table('businesses').select('id').limit(1).execute()
    print("Successfully connected to 'businesses'.")
    
    # Try to get all tables via RPC or direct query if enabled
    # Since we don't have get_tables RPC, we'll try common variations
    tables_to_try = ['reviews', 'review', 'business_reviews', 'user_reviews', 'listing_reviews']
    for t in tables_to_try:
        try:
            r = supabase.table(t).select('count', count='exact').limit(0).execute()
            print(f"Table '{t}' found! Count: {r.count}")
        except Exception as e:
            if "PGRST205" in str(e):
                print(f"Table '{t}' not found.")
            else:
                print(f"Table '{t}' error: {e}")

except Exception as e:
    print(f"Initial connection error: {e}")
