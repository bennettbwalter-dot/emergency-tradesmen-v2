import os
import requests
import json

# Project 2 (xwqvhym...)
url = "https://xwqvhymkwuasotsgmarn.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cXZoeW1rd3Vhc290c2dtYXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTAzNDMsImV4cCI6MjA4MTU2NjM0M30.nHErFkf6SIMzj-b_bwWBlHL4NmQ288rQUZLCIg6jH5Y"

headers = {
    "apikey": key,
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

try:
    # Query PostgREST for OpenAPI spec
    resp = requests.get(f"{url}/rest/v1/", headers=headers)
    if resp.status_code == 200:
        spec = resp.json()
        definitions = spec.get('definitions', {})
        biz_def = definitions.get('businesses', {})
        properties = biz_def.get('properties', {})
        if properties:
            columns = set(properties.keys())
            required_columns = ['tier', 'priority_score', 'is_premium', 'verified', 'is_available_now']
            
            print("--- Production Schema Verification ---")
            for col in required_columns:
                status = "✅" if col in columns else "❌"
                print(f"{status} Column '{col}'")
            
            print("\nAll columns found:")
            print(", ".join(sorted(columns)))
        else:
            print("Could not find 'businesses' table definition in OpenAPI spec.")
    else:
        print(f"Error: {resp.status_code} {resp.text}")
except Exception as e:
    print(f"Request failed: {e}")
