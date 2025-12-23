import os
from dotenv import load_dotenv

curr_dir = os.path.dirname(os.path.abspath(__file__))
prod_env_path = os.path.join(curr_dir, '..', '.env.production')
load_dotenv(prod_env_path)

print(f"VITE_SUPABASE_URL: {os.getenv('VITE_SUPABASE_URL')}")
# Just print the middle of the key to verify it's not empty/wrong project
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
if key:
    print(f"SUPABASE_SERVICE_ROLE_KEY: {key[:10]}...{key[-10:]}")
else:
    print("SUPABASE_SERVICE_ROLE_KEY: MISSING")
