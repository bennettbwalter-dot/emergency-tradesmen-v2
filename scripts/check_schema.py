
import os
from supabase import create_client, Client
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.environ.get("\ufeffVITE_SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Get schema info? Supabase-py doesn't have direct schema reflection easily without SQL.
# But we can try to insert a dummy row and see the error validation or just print columns if possible.
# Easier: Just select one row and print keys.
res = supabase.table("businesses").select("*").limit(1).execute()
if res.data:
    print("Columns:", list(res.data[0].keys()))
else:
    print("No data to infer columns.")
