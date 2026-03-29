
import os
import time
import random
from supabase import create_client, Client

# Load env
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
# We need Service Role Key to bypass RLS for creation/deletion generally, 
# or we need to be a logged in user. 
# For this test, we'll try to use the key we found earlier which seemed to be a service key counterpart 
# OR we will fall back to ANON key but that might fail if RLS is strict.
# Ideally we use the Service Role Key for admin-level testing.
KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("VITE_SUPABASE_ANON_KEY")

if not URL or not KEY:
    print("Error: Missing credentials")
    exit(1)

supabase: Client = create_client(URL, KEY)

import uuid

# Test Data
TEST_ID = str(uuid.uuid4())
TEST_BUSINESS = {
    "id": TEST_ID,
    "name": f"CRUD Test Plumbers {random.randint(1000,9999)}",
    "slug": f"crud-test-plumber-{random.randint(1000,9999)}",
    "trade": "plumber",
    "city": "London",
    "phone": "07700900000",
    "email": f"test-{random.randint(1000,9999)}@example.com",
    "rating": 5.0,
    "review_count": 0,
    "tier": "free"
}

print("=== Starting CRUD Verification ===")

# 1. CREATE
print(f"\n[1/4] Create: Inserting '{TEST_BUSINESS['name']}'...", end=" ")
try:
    res = supabase.table("businesses").insert(TEST_BUSINESS).execute()
    # Supabase-py < 2.0 returns .data, 2.0+ returns .data. 
    # Current installed version is 2.27.0
    if res.data:
        print("SUCCESS")
        created_id = res.data[0]['id']
    else:
        print("FAILED (No data returned)")
        exit(1)
except Exception as e:
    print(f"FAILED: {e}")
    exit(1)

# 2. READ
print(f"\n[2/4] Read: Fetching ID {created_id}...", end=" ")
try:
    res = supabase.table("businesses").select("*").eq("id", created_id).execute()
    if res.data and res.data[0]['name'] == TEST_BUSINESS['name']:
        print("SUCCESS")
    else:
        print("FAILED (Data mismatch or not found)")
        exit(1)
except Exception as e:
    print(f"FAILED: {e}")
    exit(1)

# 3. UPDATE
print(f"\n[3/4] Update: Changing name to 'UPDATED Name'...", end=" ")
try:
    res = supabase.table("businesses").update({"name": "UPDATED Name"}).eq("id", created_id).execute()
    if res.data and res.data[0]['name'] == "UPDATED Name":
        print("SUCCESS")
    else:
        print("FAILED (Update didn't persist)")
        exit(1)
except Exception as e:
    print(f"FAILED: {e}")
    exit(1)

# 4. DELETE
print(f"\n[4/4] Delete: Removing test record...", end=" ")
try:
    res = supabase.table("businesses").delete().eq("id", created_id).execute()
    # Verify deletion
    check = supabase.table("businesses").select("*").eq("id", created_id).execute()
    if not check.data:
        print("SUCCESS")
    else:
        print("FAILED (Record still exists)")
        exit(1)
except Exception as e:
    print(f"FAILED: {e}")
    exit(1)

print("\n=== CRUD Verification Complete: ALL PASSED ===")
