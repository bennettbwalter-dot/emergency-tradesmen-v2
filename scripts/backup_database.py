
import os
import json
import datetime
from pathlib import Path
from supabase import create_client, Client

# Load environment variables (manually since we are in a script)
def load_env():
    env = {}
    try:
        with open('.env', 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                key, value = line.split('=', 1)
                env[key] = value
    except Exception:
        print("Could not load .env file")
    return env

env = load_env()
URL = env.get("VITE_SUPABASE_URL")
# Try Service Role Key first, then fall back to Anon (which won't get protected data)
# Note: The key in the file was labeled oddly, but we will try it.
# If it fails, we warn.
KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY")

if not URL or not KEY:
    print("Error: Missing VITE_SUPABASE_URL or Key in .env")
    exit(1)

print(f"Connecting to Supabase at {URL}...")
# Init client
supabase: Client = create_client(URL, KEY)

# Tables to backup
TABLES = [
    "businesses",
    "blog_posts",
    "profiles",
    "contact_submissions",
    "subscriptions",
    "newsletter_subscribers"
]

# Create backup dir
dts = datetime.datetime.now().strftime("%Y-%m-%d_%H%M%S")
backup_dir = Path.home() / "Desktop" / f"emergency-tradesmen-db-backup-{dts}"
backup_dir.mkdir(parents=True, exist_ok=True)

print(f"Starting backup to: {backup_dir}")

for table in TABLES:
    print(f"Backing up table: {table}...", end=" ")
    try:
        # Fetch all rows (pagination might be needed for huge tables, but for <10k rows usually okay in one chunk or we loop)
        # Supabase API limits to 1000 rows by default. We need to loop.
        
        all_data = []
        start = 0
        batch_size = 1000
        while True:
            response = supabase.table(table).select("*").range(start, start + batch_size - 1).execute()
            data = response.data
            all_data.extend(data)
            
            if len(data) < batch_size:
                break
            start += batch_size
            
        print(f"Success! ({len(all_data)} rows)")
        
        file_path = backup_dir / f"{table}.json"
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(all_data, f, indent=2, default=str)
            
    except Exception as e:
        print(f"FAILED. Error: {e}")

print("\nBackup complete!")
