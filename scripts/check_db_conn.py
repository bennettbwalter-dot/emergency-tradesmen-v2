import os
from dotenv import load_dotenv

curr_dir = os.path.dirname(os.path.abspath(__file__))
prod_env_path = os.path.join(curr_dir, '..', '.env.production')
load_dotenv(prod_env_path)

db_url = os.getenv('DATABASE_URL')
if db_url:
    print(f"DATABASE_URL found: {db_url[:15]}...{db_url[-5:]}")
else:
    print("DATABASE_URL: MISSING")
