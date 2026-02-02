import os
import requests
import json
import re
from dotenv import load_dotenv

# Load .env
load_dotenv()

supabase_url = os.getenv('VITE_SUPABASE_URL')
supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

if not supabase_url or not supabase_key:
    # Try reading directly if load_dotenv failed
    env_path = '.env'
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            content = f.read()
            u = re.search(r'VITE_SUPABASE_URL\s*=\s*([^\s]+)', content)
            k = re.search(r'VITE_SUPABASE_ANON_KEY\s*=\s*([^\s]+)', content)
            if u: supabase_url = u.group(1).strip('"').strip("'")
            if k: supabase_key = k.group(1).strip('"').strip("'")

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found.")
    exit(1)

headers = {
    "apikey": supabase_key,
    "Authorization": f"Bearer {supabase_key}",
}

def get_stats():
    # Get a sample to see columns
    sample_url = f"{supabase_url}/rest/v1/businesses?limit=5"
    r = requests.get(sample_url, headers=headers)
    if r.status_code != 200:
        print(f"Error fetching sample: {r.status_code}")
        print(r.text)
        return
    
    sample = r.json()
    if not sample:
        print("No businesses found in table.")
        return
    
    print("--- Sample Rows ---")
    for i, row in enumerate(sample):
        print(f"Row {i+1}: Name={row.get('name')}, City={row.get('city')}, Country={row.get('country_code')}, Trade={row.get('trade')}")
    
    # Check for UK vs US identifiers
    print("\n--- Listing Counts ---")
    
    # 1. Total count
    count_headers = {"apikey": supabase_key, "Authorization": f"Bearer {supabase_key}", "Prefer": "count=exact"}
    
    def get_count(filter_str=""):
        url = f"{supabase_url}/rest/v1/businesses?select=id{filter_str}"
        resp = requests.get(url, headers=count_headers)
        range_val = resp.headers.get('Content-Range', '0/0')
        return range_val.split('/')[-1]

    total = get_count()
    print(f"Total Listings: {total}")
    
    us_total = get_count("&country_code=eq.US")
    # Some might have 'USA' or null if old
    usa_total = get_count("&country_code=eq.USA")
    
    uk_total = get_count("&country_code=eq.GB")
    gb_total = get_count("&country_code=eq.UK")
    
    null_country = get_count("&country_code=is.null")
    
    print(f"US Listings (US): {us_total}")
    print(f"USA Listings (USA): {usa_total}")
    print(f"UK Listings (GB): {uk_total}")
    print(f"UK Listings (UK): {gb_total}")
    print(f"Country Null: {null_country}")

    # 3. Enrichment stats
    email_total = get_count("&email=not.is.null")
    print(f"Enriched with Email: {email_total}")
    
    website_total = get_count("&website=not.is.null")
    print(f"Enriched with Website: {website_total}")
    
    # Check for NON-EMPTY social links
    # PostgREST can check for non-empty objects using .not.eq.{}
    social_count_url = f"{supabase_url}/rest/v1/businesses?social_links=not.eq.%7B%7D&select=id"
    r = requests.get(social_count_url, headers=count_headers)
    social_total = r.headers.get('Content-Range', '0/0').split('/')[-1]
    print(f"Enriched with Social Links (non-empty): {social_total}")

    # 4. Detailed Verification Breakdown
    print("\n--- Verification Breakdown ---")
    countries = ["US", "GB"]
    for c in countries:
        v_true = get_count(f"&country_code=eq.{c}&verified=eq.true")
        v_false = get_count(f"&country_code=eq.{c}&verified=eq.false")
        print(f"{c}: Verified={v_true}, Unverified={v_false}")
    
    # Check for null country verification
    nc_v_true = get_count("&country_code=is.null&verified=eq.true")
    nc_v_false = get_count("&country_code=is.null&verified=eq.false")
    print(f"Null Country: Verified={nc_v_true}, Unverified={nc_v_false}")

    # 5. Global Stats
    verified_total = get_count("&verified=eq.true")
    print(f"\nGlobal Total Verified: {verified_total}")

if __name__ == "__main__":
    get_stats()
