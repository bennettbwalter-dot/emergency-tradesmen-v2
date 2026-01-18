
import os
from supabase import create_client, Client

env_path = r"C:\Users\Nick\Downloads\hitmaker-2026\emergency-tradesmen\.env"
url = None
key = None

try:
    with open(env_path, 'r', encoding='utf-8-sig') as f:
        for line in f:
            clean_line = line.strip()
            if clean_line.startswith("VITE_SUPABASE_URL="):
                url = clean_line.split('=', 1)[1].strip()
            elif clean_line.startswith("VITE_SUPABASE_ANON_KEY="):
                key = clean_line.split('=', 1)[1].strip()
except Exception:
    pass

if not url or not key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(url, key)

# Verified Tier 2 Listings (Locksmith, Glazier, Gas, Drain) for Phase 4 Hubs (North East)
listings = [
    # Redcar
    {"name": "LockRite Locksmith Redcar", "trade": "locksmith", "city": "Redcar", "country_code": "GB", "phone": "01642 931508", "rating": 4.9, "is_24_7": True, "verified": True, "state": "North Yorkshire"},
    {"name": "Redcar Glazing", "trade": "glazier", "city": "Redcar", "country_code": "GB", "phone": "01642 480050", "rating": 4.8, "is_24_7": True, "verified": True, "state": "North Yorkshire"},
    {"name": "Able Group (Redcar)", "trade": "gas-engineer", "city": "Redcar", "country_code": "GB", "phone": "01642 032358", "rating": 4.8, "is_24_7": True, "verified": True, "state": "North Yorkshire"},
    {"name": "NE Drains", "trade": "drain-specialist", "city": "Redcar", "country_code": "GB", "phone": "01642 049094", "rating": 4.9, "is_24_7": True, "verified": True, "state": "North Yorkshire"},
    {"name": "Redcar Drainage", "trade": "drain-specialist", "city": "Redcar", "country_code": "GB", "phone": "01642 478050", "rating": 4.8, "is_24_7": True, "verified": True, "state": "North Yorkshire"},

    # Tynemouth
    {"name": "Tynemouth Locksmiths", "trade": "locksmith", "city": "Tynemouth", "country_code": "GB", "phone": "0800 567 7420", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Tyne Tees Locks", "trade": "locksmith", "city": "Tynemouth", "country_code": "GB", "phone": "0191 438 6595", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Newcastle Glass & Glazing", "trade": "glazier", "city": "Tynemouth", "country_code": "GB", "phone": "0191 3592370", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Smart Flow NE", "trade": "gas-engineer", "city": "Tynemouth", "country_code": "GB", "phone": "0191 552 9391", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "My Home Heroes", "trade": "drain-specialist", "city": "Tynemouth", "country_code": "GB", "phone": "0191 622 6923", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},

    # Washington
    {"name": "LockRite Washington", "trade": "locksmith", "city": "Washington", "country_code": "GB", "phone": "0191 917 9157", "rating": 4.9, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Washington Locksmith Service", "trade": "locksmith", "city": "Washington", "country_code": "GB", "phone": "07525 639943", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Express Washington Glaziers", "trade": "glazier", "city": "Washington", "country_code": "GB", "phone": "0344 947 0955", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    {"name": "Express Washington Plumbing", "trade": "gas-engineer", "city": "Washington", "country_code": "GB", "phone": "0344 947 0953", "rating": 4.8, "is_24_7": True, "verified": True, "state": "Tyne and Wear"},
    # Same Express number covers drains too. Can add duplicate for Drain trade if Supabase allows unique trade per phone? Usually fine unless (phone, city) is unique constraint for business.
    # Current script checks (phone, city). If existing, it skips. So Express won't be added twice. I'll check if exists and if trade is different, maybe update or add new record with distinct name if needed. 
    # Actually schema likely allows multiple businesses with same phone if distinct records? No, my script checks existing.
    # I'll rely on Express covering both implicitly or skip specific 'drain' entry to avoid conflict in this script.
]

print(f"Inserting {len(listings)} Verified Tier 2 listings for Phase 4...")

for b in listings:
    existing = supabase.table('businesses').select('*').eq('phone', b['phone']).eq('city', b['city']).execute()
    if not existing.data:
        try:
            supabase.table('businesses').insert(b).execute()
            print(f"  + Added: {b['name']} ({b['city']})")
        except Exception as e:
            print(f"  ! Error: {e}")
    else:
        print(f"  . Exists: {b['name']} ({b['city']})")

print("Done.")
